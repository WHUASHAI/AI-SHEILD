import { cookies } from 'next/headers';
import { auth } from './auth';
import { getAuthDatabase } from './auth-db';
import { resolveAccountIdentity } from './history-account';
import { guestTokenHash, HistoryError, type ScanOwner } from './history-core';
import { GUEST_COOKIE_NAME, isGuestCookie } from './guest-mode';

export const PRIVATE_GUEST_COOKIE = 'aishield_guest_session';
export const GUEST_MAX_AGE = 365 * 24 * 60 * 60;

export async function resolveScanOwner(): Promise<ScanOwner> {
  const jar = await cookies();
  if (isGuestCookie(jar.get(GUEST_COOKIE_NAME)?.value)) {
    const token = jar.get(PRIVATE_GUEST_COOKIE)?.value;
    const id = guestTokenHash(token);
    if (!id) throw new HistoryError('Enter guest mode again to start private history.', 401);
    jar.set(PRIVATE_GUEST_COOKIE, token!, {httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV === 'production', path:'/', maxAge:GUEST_MAX_AGE});
    return {kind:'guest',id};
  }
  const session = await auth();
  if (!session?.user?.id) throw new HistoryError('Sign in or enter guest mode.', 401);
  const db = getAuthDatabase();
  const id = await resolveAccountIdentity(session.user.id, session.user, {
    findUser: id => db.user.findUnique({where:{id},select:{id:true}}),
    findProvider: id => db.account.findUnique({where:{provider_providerAccountId:{provider:'google',providerAccountId:id}},select:{userId:true}}),
    async createGoogle(providerAccountId, email, name) {
      try {
        const user = await db.user.create({data:{email,name,emailVerified:new Date(),accounts:{create:{provider:'google',type:'oidc',providerAccountId}}},select:{id:true}});
        return user.id;
      } catch {
        // A concurrent first request may have provisioned this exact provider identity.
        const account = await db.account.findUnique({where:{provider_providerAccountId:{provider:'google',providerAccountId}}});
        if (account) return account.userId;
        throw new HistoryError('Could not link this Google account. Use its original sign-in method if the email is already registered.',409);
      }
    },
  });
  return {kind:'user',id};
}
