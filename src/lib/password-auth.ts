import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().max(254).email();
const credentialsSchema = z.object({ email: emailSchema, password: z.string().min(8).max(256) });
const hashPattern = /^scrypt-v1\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const dummyHash = `scrypt-v1$${'0'.repeat(32)}$${'0'.repeat(128)}`;
const windowMs = 600_000;
const buckets = new Map<string, { attempts: number; expires: number }>();

export type PasswordAccount = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  passwordHash: string | null;
};

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string' || password.length < 8 || password.length > 256) {
    throw new Error('Password must contain 8 to 256 characters.');
  }
  const salt = randomBytes(16);
  const key = await derivePassword(password, salt);
  return `scrypt-v1$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: unknown): Promise<boolean> {
  if (typeof password !== 'string' || password.length < 8 || password.length > 256) return false;
  const parts = typeof hash === 'string' ? hashPattern.exec(hash) : null;
  const selected = parts ?? hashPattern.exec(dummyHash)!;
  const actual = await derivePassword(password, Buffer.from(selected[1], 'hex'));
  return timingSafeEqual(actual, Buffer.from(selected[2], 'hex')) && parts !== null;
}

export async function authenticatePasswordAccount(
  credentials: unknown,
  lookup: (email: string) => Promise<PasswordAccount | null>,
) {
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) return null;
  const { email, password } = parsed.data;
  let account: PasswordAccount | null;
  try { account = await lookup(email); }
  catch { account = null; }
  const matches = await verifyPassword(password, account?.passwordHash);
  if (!matches || !account?.id || emailSchema.safeParse(account.email).data !== email
    || !(account.emailVerified instanceof Date) || !Number.isFinite(account.emailVerified.getTime())
    || account.emailVerified.getTime() > Date.now()) return null;
  return { id: account.id, name: account.name, email, emailVerified: true };
}

export function consumePasswordAttempt(email: unknown, clientId: string, now = Date.now()) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success || !clientId || clientId.length > 256 || !Number.isFinite(now) || now < 0) {
    return { allowed: false, retryAfter: 600 };
  }
  for (const [key, bucket] of buckets) if (bucket.expires <= now) buckets.delete(key);
  const limits = [[`email:${parsed.data}`, 5], [`client:${clientId}`, 20]] as const;
  const entries = limits.map(([identity, limit]) => ({
    key: createHash('sha256').update(identity).digest('hex'), limit,
  }));
  const missing = entries.filter(entry => !buckets.has(entry.key)).length;
  if (buckets.size + missing > 10_000) return { allowed: false, retryAfter: 600 };
  for (const { key, limit } of entries) {
    const bucket = buckets.get(key);
    if (bucket && bucket.attempts >= limit) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((bucket.expires - now) / 1000)) };
    }
  }
  for (const { key } of entries) {
    const bucket = buckets.get(key) ?? { attempts: 0, expires: now + windowMs };
    bucket.attempts++;
    buckets.set(key, bucket);
  }
  return { allowed: true, retryAfter: 0 };
}
