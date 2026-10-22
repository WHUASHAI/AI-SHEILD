export class ProviderError extends Error {
  status: number;
  code: string;
  retryAfter?: string;
  constructor(message: string,status=503,code='PROVIDER_UNAVAILABLE',retryAfter?: string) {
    super(message);this.status=status;this.code=code;this.retryAfter=retryAfter;
  }
}

// Inspect upstream errors for classification only; never expose their bodies or URLs.
export async function readProviderJson<T=unknown>(response:Response,provider:string):Promise<T> {
  const delay=response.headers.get('Retry-After')??'';
  const retryAfter=/^\d+$/.test(delay)&&Number(delay)<=86400?delay:undefined;
  const limit=()=>new ProviderError(`${provider} usage limit reached. Please try later or contact the website owner.`,429,'PROVIDER_LIMIT_REACHED',retryAfter);
  if([402,429].includes(response.status))throw limit();
  if([401,403].includes(response.status))throw new ProviderError(`${provider} authentication is unavailable. The website owner needs to check its API configuration.`,503,'PROVIDER_CONFIGURATION_ERROR');
  let data: unknown;
  try {data=await response.json();}
  catch {throw new ProviderError(`${provider} returned an unreadable response. Please try later.`,response.ok?502:503,'INVALID_PROVIDER_RESPONSE');}
  const record=data && typeof data==='object'&&!Array.isArray(data)?data as Record<string,unknown>:null;
  const error=record?.error;
  const errorInfo=error && typeof error==='object'?error as Record<string,unknown>:null;
  const description=String(errorInfo?.type??'')+' '+String(errorInfo?.message??error??'');
  if(/quota|usage.limit|rate.limit|too many|credit|exhausted|out of searches/i.test(description))throw limit();
  const successfulEmptySearch=provider==='SerpApi'&&(record?.search_metadata as {status?:string}|undefined)?.status==='Success';
  if(!response.ok||record?.status==='failure'||(record?.search_metadata as {status?:string}|undefined)?.status==='Error'||(error&&!successfulEmptySearch))throw new ProviderError(`${provider} is temporarily unavailable. No detection result was generated.`);
  if(data===null||typeof data!=='object')throw new ProviderError(`${provider} returned an invalid response.`,502,'INVALID_PROVIDER_RESPONSE');
  return data as T;
}
