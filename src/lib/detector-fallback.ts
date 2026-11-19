// Each upstream service has its own cooldown. An outage in one service
// must not suppress requests to another.
export function createProviderCooldown(now = () => Date.now()) {
  let unavailableUntil = 0;
  return {
    blocked: () => now() < unavailableUntil,
    remember(response: Response) {
      const seconds = Number(response.headers.get('Retry-After'));
      const delay = seconds > 0 && seconds <= 86400 ? seconds * 1000 : [402, 429].includes(response.status) ? 300000 : 15000;
      unavailableUntil = now() + delay;
    },
  };
}
export const sightengineCooldown = createProviderCooldown();
export const searchCooldown = createProviderCooldown();

export async function submitWithDetectorBackup(
  primary: () => Promise<Response>, backup: () => Promise<unknown>,
  policy: ReturnType<typeof createProviderCooldown>, onSwitch: () => void = () => {},
): Promise<Response> {
  const local = async () => { onSwitch(); return Response.json(await backup()); };
  if (policy.blocked()) return local();
  let response: Response;
  try { response = await primary(); }
  catch (error) {
    if (!(error instanceof TypeError)) throw error;
    // A network outage may still permit already-cached browser models to run.
    return local();
  }
  if (response.ok || ![402, 429, 502, 503, 504].includes(response.status)) return response;
  // 401/403, invalid input, and operation conflicts never fall through to backup.
  if ([402, 429].includes(response.status)) {
    const data = await response.clone().json().catch(() => null);
    if (data?.code && data.code !== 'PROVIDER_LIMIT_REACHED') return response;
  }
  policy.remember(response);
  return local();
}
