import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const WHATSAPP_CHALLENGE_COOKIE = "aishield.whatsapp-verification";
export const WHATSAPP_CHALLENGE_TTL = 300;

type WhatsAppConfig = {
  accountSid: string;
  authToken: string;
  serviceSid: string;
};

type WhatsAppChallenge = { phone: string; sid: string };
type QuotaResult = { allowed: boolean; retryAfter: number };

const UPSTREAM_TIMEOUT_MS = 10_000;
const CHALLENGE_MAX_LENGTH = 1_024;
const QUOTA_WINDOW_MS = 600_000;
const MAX_QUOTA_BUCKETS = 10_000;
const quotaBuckets = new Map<string, number[]>();
let nextQuotaSweep = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSid(value: unknown, prefix: "AC" | "VA" | "VE"): value is string {
  return (
    typeof value === "string" &&
    value.length === 34 &&
    new RegExp(`^${prefix}[0-9a-fA-F]{32}$`).test(value)
  );
}

function isPlaceholder(value: string): boolean {
  return (
    /placeholder|replace[\s_-]*(?:me|with)|change[\s_-]*me|your[\s_-]*(?:auth|secret|token|key|credential)|example|insert[\s_-]*(?:secret|token|key)/i.test(value) ||
    /(?:^|[\s_-])(?:your|dummy|todo|tbd)(?:$|[\s_-])/i.test(value) ||
    /^<.*>$/u.test(value) ||
    /^(.)\1{7,}$/u.test(value)
  );
}

function configuredValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.length > 256 ||
    /[\u0000-\u001f\u007f]/u.test(trimmed) ||
    isPlaceholder(trimmed)
  ) return null;
  return trimmed;
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 64) return null;
  const phone = value.replace(/[\s()-]/gu, "");
  return /^\+[1-9][0-9]{6,14}$/.test(phone) ? phone : null;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const accountSid = configuredValue(process.env.TWILIO_ACCOUNT_SID);
  const authToken = configuredValue(process.env.TWILIO_AUTH_TOKEN);
  const serviceSid = configuredValue(process.env.TWILIO_VERIFY_SERVICE_SID);
  if (
    !isSid(accountSid, "AC") ||
    !isSid(serviceSid, "VA") ||
    !authToken ||
    /^([0-9a-f])\1{31}$/i.test(accountSid.slice(2)) ||
    /^([0-9a-f])\1{31}$/i.test(serviceSid.slice(2))
  ) return null;
  return { accountSid, authToken, serviceSid };
}

function unavailable(): Error {
  // Never include provider messages, response bodies, phone numbers, or codes.
  return new Error("WhatsApp verification is unavailable. Please try again later.");
}

async function postTwilio(
  resource: "Verifications" | "VerificationCheck",
  parameters: Record<string, string>,
): Promise<{ status: number; body: unknown }> {
  const config = getWhatsAppConfig();
  if (!config) throw new Error("WhatsApp sign-in is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${config.serviceSid}/${resource}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(parameters),
        signal: controller.signal,
        redirect: "error",
        cache: "no-store",
      },
    );
    // Error bodies can contain personal information and credentials. Ignore them.
    const body: unknown = response.ok ? await response.json() : null;
    return { status: response.status, body };
  } catch {
    throw unavailable();
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestWhatsAppCode(phone: string): Promise<{ sid: string }> {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("Enter a valid international phone number.");
  const { status, body } = await postTwilio("Verifications", {
    To: normalized,
    Channel: "whatsapp",
  });
  if (
    status < 200 || status >= 300 ||
    !isRecord(body) ||
    !isSid(body.sid, "VE") ||
    body.to !== normalized ||
    body.channel !== "whatsapp" ||
    body.status !== "pending"
  ) throw unavailable();
  return { sid: body.sid };
}

export async function verifyWhatsAppCode(
  phone: string,
  code: string,
  verificationSid: string,
): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (
    !normalized ||
    typeof code !== "string" ||
    code.length !== 6 ||
    !/^[0-9]{6}$/.test(code) ||
    !isSid(verificationSid, "VE")
  ) return false;

  const { status, body } = await postTwilio("VerificationCheck", {
    VerificationSid: verificationSid,
    Code: code,
  });
  // Twilio deletes expired, approved, or exhausted verification resources.
  if (status === 400 || status === 404 || status === 410) return false;
  if (status < 200 || status >= 300 || !isRecord(body)) throw unavailable();
  return (
    body.status === "approved" &&
    body.sid === verificationSid &&
    body.to === normalized &&
    body.channel === "whatsapp"
  );
}

function usableSecret(secret: unknown): secret is string {
  return (
    typeof secret === "string" &&
    secret.length >= 32 &&
    secret.length <= 4_096 &&
    secret.trim() === secret &&
    !/[\u0000-\u001f\u007f]/u.test(secret) &&
    !isPlaceholder(secret)
  );
}

function validTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= Number.MAX_SAFE_INTEGER - WHATSAPP_CHALLENGE_TTL * 1_000
  );
}

function challengeMac(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret)
    .update(`${WHATSAPP_CHALLENGE_COOKIE}:${payload}`)
    .digest();
}

/** Pre-login binding only: Auth.js must issue the authenticated session. */
export function createWhatsAppChallenge(
  phone: string,
  sid: string,
  secret: string,
  now: number = Date.now(),
): string {
  const normalized = normalizePhone(phone);
  if (!usableSecret(secret) || !normalized || !isSid(sid, "VE") || !validTimestamp(now)) {
    throw new Error("Unable to create WhatsApp verification challenge.");
  }
  // A code or provider credential must never be stored in this signed cookie.
  const payload = Buffer.from(JSON.stringify({ v: 1, phone: normalized, sid, iat: now })).toString("base64url");
  return `${payload}.${challengeMac(payload, secret).toString("base64url")}`;
}

export function readWhatsAppChallenge(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): WhatsAppChallenge | null {
  if (
    !usableSecret(secret) || !validTimestamp(now) ||
    typeof token !== "string" || token.length > CHALLENGE_MAX_LENGTH
  ) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;

  try {
    const received = Buffer.from(signature, "base64url");
    const expected = challengeMac(payload, secret);
    if (
      received.length !== expected.length ||
      received.toString("base64url") !== signature ||
      !timingSafeEqual(received, expected)
    ) return null;
    const decoded = Buffer.from(payload, "base64url");
    if (decoded.toString("base64url") !== payload) return null;
    const value: unknown = JSON.parse(decoded.toString("utf8"));
    if (
      !isRecord(value) ||
      Object.keys(value).length !== 4 ||
      value.v !== 1 ||
      typeof value.phone !== "string" ||
      normalizePhone(value.phone) !== value.phone ||
      !isSid(value.sid, "VE") ||
      !validTimestamp(value.iat) ||
      value.iat > now ||
      now - value.iat >= WHATSAPP_CHALLENGE_TTL * 1_000
    ) return null;
    return { phone: value.phone, sid: value.sid };
  } catch {
    return null;
  }
}

function sweepQuotaBuckets(now: number): void {
  for (const [key, attempts] of quotaBuckets) {
    if (attempts[attempts.length - 1] <= now - QUOTA_WINDOW_MS) quotaBuckets.delete(key);
  }
  nextQuotaSweep = now + 60_000;
}

/**
 * Process-local defense only. Distributed deployments must also configure
 * shared/provider rate limits. Active buckets are never evicted to admit new
 * identities: when capacity is reached, requests fail closed until expiry.
 */
export function consumeWhatsAppQuota(
  action: "send" | "verify",
  phone: string,
  clientId: string,
  now: number = Date.now(),
): QuotaResult {
  const normalized = normalizePhone(phone);
  if (
    (action !== "send" && action !== "verify") || !normalized ||
    typeof clientId !== "string" || !clientId.trim() || clientId.length > 256 ||
    /[\u0000-\u001f\u007f]/u.test(clientId) || !validTimestamp(now)
  ) return { allowed: false, retryAfter: 600 };

  if (now >= nextQuotaSweep || quotaBuckets.size >= MAX_QUOTA_BUCKETS - 2) sweepQuotaBuckets(now);
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  const phoneKey = `${action}:phone:${hash(normalized)}`;
  const clientKey = `${action}:client:${hash(clientId)}`;
  const phoneAttempts = (quotaBuckets.get(phoneKey) ?? []).filter((time) => time > now - QUOTA_WINDOW_MS);
  const clientAttempts = (quotaBuckets.get(clientKey) ?? []).filter((time) => time > now - QUOTA_WINDOW_MS);
  const phoneLimit = action === "send" ? 3 : 5;
  const clientLimit = action === "send" ? 10 : 20;
  let retryAt = now;
  if (phoneAttempts.length >= phoneLimit) retryAt = Math.max(retryAt, phoneAttempts[0] + QUOTA_WINDOW_MS);
  if (clientAttempts.length >= clientLimit) retryAt = Math.max(retryAt, clientAttempts[0] + QUOTA_WINDOW_MS);
  if (action === "send" && phoneAttempts.length > 0) {
    retryAt = Math.max(retryAt, phoneAttempts[phoneAttempts.length - 1] + 60_000);
  }
  if (retryAt > now) return { allowed: false, retryAfter: Math.ceil((retryAt - now) / 1_000) };

  const newBuckets = Number(!quotaBuckets.has(phoneKey)) + Number(!quotaBuckets.has(clientKey));
  if (quotaBuckets.size + newBuckets > MAX_QUOTA_BUCKETS) return { allowed: false, retryAfter: 600 };
  quotaBuckets.set(phoneKey, [...phoneAttempts, now]);
  quotaBuckets.set(clientKey, [...clientAttempts, now]);
  return { allowed: true, retryAfter: 0 };
}
