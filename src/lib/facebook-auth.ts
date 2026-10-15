import { z } from 'zod';
import Facebook from 'next-auth/providers/facebook';

const identitySchema = z.object({ id: z.string().max(32).regex(/^[1-9][0-9]*$/) });
const emailSchema = z.string().max(254).email();

function failed() { return new Error('Facebook account verification failed.'); }
function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function createFacebookProvider(apiVersion: string | undefined) {
  if (!apiVersion || !/^v\d{2}\.\d+$/.test(apiVersion) || apiVersion.length > 12) throw failed();
  return Facebook({
    // Request credential confirmation on Facebook, including for an existing Facebook session.
    authorization: {
      url: `https://www.facebook.com/${apiVersion}/dialog/oauth`,
      params: { scope: 'email', auth_type: 'reauthenticate' },
    },
    token: `https://graph.facebook.com/${apiVersion}/oauth/access_token`,
    userinfo: {
      url: `https://graph.facebook.com/${apiVersion}/me?fields=id,name,email,picture`,
      async request({ tokens }: { tokens: { access_token?: string } }) {
        return requestFacebookProfile(tokens.access_token, apiVersion);
      },
    },
    profile: getFacebookIdentity,
    checks: ['state'],
  });
}

export function getFacebookIdentity(value: unknown) {
  const identity = identitySchema.safeParse(value);
  const profile = record(value);
  if (!identity.success || !profile) throw failed();
  const picture = record(record(profile.picture)?.data)?.url;
  let image: string | null = null;
  try {
    if (typeof picture === 'string') {
      const url = new URL(picture);
      if (url.protocol === 'https:' && !url.username && !url.password) image = url.href;
    }
  } catch { /* A profile photo is optional and never determines account validity. */ }
  return {
    id: identity.data.id,
    name: typeof profile.name === 'string' && profile.name.length <= 256 ? profile.name : null,
    email: emailSchema.safeParse(profile.email).success ? String(profile.email).toLowerCase() : null,
    image,
  };
}

export async function requestFacebookProfile(accessToken: unknown, apiVersion: unknown): Promise<Record<string, unknown>> {
  if (typeof accessToken !== 'string' || !accessToken || accessToken.length > 4096 || /\s/.test(accessToken)
    || typeof apiVersion !== 'string' || !/^v\d{2}\.\d+$/.test(apiVersion) || apiVersion.length > 12) throw failed();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/me?fields=id,name,email,picture`, {
      headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal,
      redirect: 'error', cache: 'no-store',
    });
    if (!response.ok) throw failed();
    const body: unknown = await response.json();
    getFacebookIdentity(body);
    return record(body)!;
  } catch { throw failed(); }
  finally { controller.abort(); clearTimeout(timeout); }
}
