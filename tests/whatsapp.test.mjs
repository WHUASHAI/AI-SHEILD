import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";

// Only an absent implementation is handled here, so the first TDD run reports
// assertion failures for missing behavior rather than failing the module loader.
const whatsapp = await import("../src/lib/whatsapp.ts").catch((error) => {
  if (error.code === "ERR_MODULE_NOT_FOUND") return {};
  throw error;
});

function use(name) {
  assert.equal(typeof whatsapp[name], "function", `${name} must be implemented`);
  return whatsapp[name];
}

const PHONE = "+639171234567";
const SID = "VE1234567890abcdef1234567890abcdef";
const SECRET = "e84af63ba1dd9805377a6fe4271610b891384832d3a431046e20a26cd6ec5f44";
const ACCOUNT = "AC1234567890abcdef1234567890abcdef";
const SERVICE = "VA1234567890abcdef1234567890abcdef";
const AUTH_TOKEN = "abcdef1234567890abcdef1234567890";
const NOW = 1_800_000_000_000;
const ENV_KEYS = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"];
let previousEnv;
let previousFetch;

beforeEach(() => {
  previousEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  process.env.TWILIO_ACCOUNT_SID = ACCOUNT;
  process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN;
  process.env.TWILIO_VERIFY_SERVICE_SID = SERVICE;
  previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Unexpected HTTP request in unit test"); };
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (previousEnv[key] === undefined) delete process.env[key];
    else process.env[key] = previousEnv[key];
  }
  globalThis.fetch = previousFetch;
});

function verification(overrides = {}) {
  return {
    sid: SID, service_sid: SERVICE, account_sid: ACCOUNT, to: PHONE,
    channel: "whatsapp", status: "pending", valid: false,
    date_created: "2026-10-15T00:00:00Z", date_updated: "2026-10-15T00:00:00Z",
    lookup: {}, amount: null, payee: null, sna: null,
    send_code_attempts: [{ time: "2026-10-15T00:00:00Z", channel: "whatsapp", attempt_sid: "VL1234567890abcdef1234567890abcdef" }],
    url: `https://verify.twilio.com/v2/Services/${SERVICE}/Verifications/${SID}`,
    ...overrides,
  };
}

function check(overrides = {}) {
  return {
    sid: SID, service_sid: SERVICE, account_sid: ACCOUNT, to: PHONE,
    channel: "whatsapp", status: "approved", valid: true, amount: null, payee: null,
    sna_attempts_error_codes: [], date_created: "2026-10-15T00:00:00Z",
    date_updated: "2026-10-15T00:00:00Z", ...overrides,
  };
}

function reply(body, status = 200) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });
}

test("normalizes common international phone formatting", () => {
  const normalize = use("normalizePhone");
  assert.equal(normalize(" +63 (917) 123-4567 "), PHONE);
  assert.equal(normalize("+12345678"), "+12345678");
  assert.equal(normalize("+6907290"), "+6907290");
  assert.equal(normalize("+123456789012345"), "+123456789012345");
});

test("rejects local, oversized, nonnumeric, and nonstring phone numbers", () => {
  const normalize = use("normalizePhone");
  for (const value of [null, undefined, 639171234567, "", "09171234567", "00639171234567", "+012345678", "+123456", "+1234567890123456", "+63.9171234567", "+63/9171234567", "+63abc1234567", "++639171234567", "+６３９１７１２３４５６７", "+639171234567" + " ".repeat(10_000)]) {
    assert.equal(normalize(value), null, String(value).slice(0, 80));
  }
});

test("returns usable Twilio configuration", () => {
  assert.deepEqual(use("getWhatsAppConfig")(), { accountSid: ACCOUNT, authToken: AUTH_TOKEN, serviceSid: SERVICE });
});

test("rejects missing, malformed, and placeholder configuration", () => {
  const config = use("getWhatsAppConfig");
  for (const key of ENV_KEYS) {
    const original = process.env[key];
    for (const value of [undefined, "", "  ", "your-credential-here", "your_twilio_auth_token", "<TWILIO_AUTH_TOKEN>", "replace-me", "placeholder", "TODO"]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
      assert.equal(config(), null, key);
    }
    process.env[key] = original;
  }
  process.env.TWILIO_ACCOUNT_SID = "AC00000000000000000000000000000000";
  assert.equal(config(), null);
  process.env.TWILIO_ACCOUNT_SID = ACCOUNT;
  process.env.TWILIO_VERIFY_SERVICE_SID = "VA123";
  assert.equal(config(), null);
});

test("challenge binds the normalized number and exact verification SID for five minutes", () => {
  const create = use("createWhatsAppChallenge");
  const read = use("readWhatsAppChallenge");
  const token = create("+63 (917) 123-4567", SID, SECRET, NOW);
  assert.deepEqual(read(token, SECRET, NOW), { phone: PHONE, sid: SID });
  assert.deepEqual(read(token, SECRET, NOW + 299_999), { phone: PHONE, sid: SID });
  assert.equal(read(token, SECRET, NOW + 300_000), null);
  assert.equal(read(token, SECRET, NOW - 1), null);
});

test("challenge rejects tampered payloads, signatures, wrong secrets, and malformed tokens", () => {
  const token = use("createWhatsAppChallenge")(PHONE, SID, SECRET, NOW);
  const read = use("readWhatsAppChallenge");
  const [payload, signature] = token.split(".");
  const altered = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), phone: "+639181234567" })).toString("base64url");
  assert.equal(read(`${altered}.${signature}`, SECRET, NOW), null);
  assert.equal(read(`${payload}.${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`, SECRET, NOW), null);
  assert.equal(read(token, "39d550bfab7cfaf5d8350233b2b611f3bce78b04e309aad1907f2098ad72c0cae", NOW), null);
  for (const invalid of [undefined, "", "x.y", `${token}.extra`, "a".repeat(10_000), `${payload}.!!!!`]) {
    assert.equal(read(invalid, SECRET, NOW), null);
  }
});

test("challenge refuses short or placeholder secrets and invalid creation inputs", () => {
  const create = use("createWhatsAppChallenge");
  const read = use("readWhatsAppChallenge");
  const token = create(PHONE, SID, SECRET, NOW);
  for (const invalid of ["", "short", "your-auth-secret-replace-with-32-characters", "changeme".repeat(8)]) {
    assert.throws(() => create(PHONE, SID, invalid, NOW));
    assert.equal(read(token, invalid, NOW), null);
  }
  assert.throws(() => create("09171234567", SID, SECRET, NOW));
  assert.throws(() => create(PHONE, "VEwrong", SECRET, NOW));
  for (const invalid of [-1, NaN, Infinity, 1.5]) {
    assert.throws(() => create(PHONE, SID, SECRET, invalid));
    assert.equal(read(token, SECRET, invalid), null);
  }
});

test("challenge validates signed payload fields rather than trusting a valid MAC alone", () => {
  const read = use("readWhatsAppChallenge");
  const token = use("createWhatsAppChallenge")(PHONE, SID, SECRET, NOW);
  const original = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
  for (const changed of [{ phone: "09171234567" }, { sid: "VEwrong" }, { iat: "1800000000000" }, { iat: NOW + 1 }, { v: 99 }, { extra: "unexpected" }]) {
    const payload = Buffer.from(JSON.stringify({ ...original, ...changed })).toString("base64url");
    const mac = createHmac("sha256", SECRET).update(`aishield.whatsapp-verification:${payload}`).digest("base64url");
    assert.equal(read(`${payload}.${mac}`, SECRET, NOW), null);
  }
});

test("request uses Basic authentication and the WhatsApp channel only", async () => {
  const request = use("requestWhatsAppCode");
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify(verification()), { status: 201 });
  };
  assert.deepEqual(await request(PHONE), { sid: SID });
  assert.equal(captured.url, `https://verify.twilio.com/v2/Services/${SERVICE}/Verifications`);
  assert.equal(captured.options.method, "POST");
  const headers = new Headers(captured.options.headers);
  assert.equal(headers.get("Authorization"), `Basic ${Buffer.from(`${ACCOUNT}:${AUTH_TOKEN}`).toString("base64")}`);
  assert.equal(headers.get("Content-Type"), "application/x-www-form-urlencoded");
  assert.deepEqual(Object.fromEntries(new URLSearchParams(captured.options.body)), { To: PHONE, Channel: "whatsapp" });
  assert.ok(captured.options.signal instanceof AbortSignal);
  assert.equal(captured.options.redirect, "error");
});

test("request rejects invalid inputs before any HTTP request", async () => {
  const request = use("requestWhatsAppCode");
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response("{}"); };
  await assert.rejects(request("09171234567"));
  delete process.env.TWILIO_AUTH_TOKEN;
  await assert.rejects(request(PHONE));
  assert.equal(calls, 0);
});

test("request rejects mismatched or malformed provider verification results", async () => {
  const request = use("requestWhatsAppCode");
  for (const overrides of [{ sid: "VEwrong" }, { to: "+639181234567" }, { channel: "sms" }, { status: "approved" }]) {
    reply(verification(overrides), 201);
    await assert.rejects(request(PHONE));
  }
});

test("request hides upstream response and network error details", async () => {
  const request = use("requestWhatsAppCode");
  for (const status of [400, 401, 404, 429, 500, 503]) {
    reply({ message: "private provider payload", code: 99999 }, status);
    await assert.rejects(request(PHONE), (error) => error instanceof Error && !/private|99999/.test(error.message));
  }
  globalThis.fetch = async () => { throw new Error("private credential in network error"); };
  await assert.rejects(request(PHONE), (error) => error instanceof Error && !/private credential/.test(error.message));
  globalThis.fetch = async () => new Response("not-json", { status: 201 });
  await assert.rejects(request(PHONE), (error) => error instanceof Error && !/JSON|Unexpected token/.test(error.message));
});

test("request timeout cancels a hanging upstream call with a controlled error", async () => {
  const request = use("requestWhatsAppCode");
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("private timeout details", "AbortError")), { once: true });
  });
  const started = Date.now();
  await assert.rejects(request(PHONE), (error) => error instanceof Error && !/private timeout/.test(error.message));
  assert.ok(Date.now() - started < 15_000);
});

test("verification checks the exact SID and accepts only matching approved WhatsApp results", async () => {
  const verify = use("verifyWhatsAppCode");
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify(check()));
  };
  assert.equal(await verify(PHONE, "123456", SID), true);
  assert.equal(captured.url, `https://verify.twilio.com/v2/Services/${SERVICE}/VerificationCheck`);
  assert.deepEqual(Object.fromEntries(new URLSearchParams(captured.options.body)), { VerificationSid: SID, Code: "123456" });
  assert.equal(captured.options.method, "POST");
});

test("verification rejects malformed numbers, codes, and SIDs before calling Twilio", async () => {
  const verify = use("verifyWhatsAppCode");
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(JSON.stringify(check())); };
  for (const code of ["", "12345", "1234567", "123 456", "１２３４５６", "abcdef", "123456\n"]) {
    assert.equal(await verify(PHONE, code, SID), false);
  }
  assert.equal(await verify("09171234567", "123456", SID), false);
  assert.equal(await verify(PHONE, "123456", "VEwrong"), false);
  assert.equal(calls, 0);
});

test("verification rejects pending, expired, foreign number, foreign SID, and foreign channel results", async () => {
  const verify = use("verifyWhatsAppCode");
  for (const overrides of [{ status: "pending" }, { status: "expired" }, { status: "canceled" }, { status: "max_attempts_reached" }, { to: "+639181234567" }, { sid: "VEabcdef1234567890abcdef1234567890" }, { channel: "sms" }]) {
    reply(check(overrides));
    assert.equal(await verify(PHONE, "123456", SID), false);
  }
});

test("verification treats invalid or absent challenges as rejected", async () => {
  const verify = use("verifyWhatsAppCode");
  for (const status of [400, 404, 410]) {
    reply({ message: "private provider payload" }, status);
    assert.equal(await verify(PHONE, "123456", SID), false);
  }
});

test("verification throws controlled errors for infrastructure failures", async () => {
  const verify = use("verifyWhatsAppCode");
  for (const status of [401, 403, 429, 500, 503]) {
    reply({ message: "private provider payload" }, status);
    await assert.rejects(verify(PHONE, "123456", SID), (error) => error instanceof Error && !/private provider/.test(error.message));
  }
  globalThis.fetch = async () => { throw new Error("private network details"); };
  await assert.rejects(verify(PHONE, "123456", SID), (error) => error instanceof Error && !/private network/.test(error.message));
  globalThis.fetch = async () => new Response("not-json");
  await assert.rejects(verify(PHONE, "123456", SID));
});

test("send quota enforces one-minute cooldown with precise recovery", () => {
  const consume = use("consumeWhatsAppQuota");
  const phone = "+639171234501";
  assert.deepEqual(consume("send", phone, "cooldown-client", NOW), { allowed: true, retryAfter: 0 });
  assert.deepEqual(consume("send", phone, "cooldown-client", NOW + 1_000), { allowed: false, retryAfter: 59 });
  assert.deepEqual(consume("send", phone, "cooldown-client", NOW + 59_999), { allowed: false, retryAfter: 1 });
  assert.deepEqual(consume("send", phone, "cooldown-client", NOW + 60_000), { allowed: true, retryAfter: 0 });
});

test("send quota enforces three sends per number in ten minutes", () => {
  const consume = use("consumeWhatsAppQuota");
  const phone = "+639171234502";
  for (const offset of [0, 60_000, 120_000]) {
    assert.equal(consume("send", phone, "number-cap-client", NOW + offset).allowed, true);
  }
  assert.deepEqual(consume("send", phone, "new-client-does-not-bypass-phone-limit", NOW + 180_000), { allowed: false, retryAfter: 420 });
  assert.equal(consume("send", phone, "number-cap-client", NOW + 600_000).allowed, true);
});

test("send quota limits one client across changing phone numbers", () => {
  const consume = use("consumeWhatsAppQuota");
  for (let i = 0; i < 10; i++) {
    assert.equal(consume("send", `+6391712350${String(i).padStart(2, "0")}`, "shared-send-client", NOW).allowed, true);
  }
  assert.deepEqual(consume("send", "+639171235099", "shared-send-client", NOW), { allowed: false, retryAfter: 600 });
  assert.equal(consume("send", "+639171235099", "shared-send-client", NOW + 600_000).allowed, true);
});

test("verification quota permits five attempts per number and recovers after ten minutes", () => {
  const consume = use("consumeWhatsAppQuota");
  const phone = "+639171234503";
  for (let i = 0; i < 5; i++) assert.equal(consume("verify", phone, `verify-client-${i}`, NOW).allowed, true);
  assert.deepEqual(consume("verify", phone, "different-verify-client", NOW + 1_000), { allowed: false, retryAfter: 599 });
  assert.equal(consume("verify", phone, "different-verify-client", NOW + 600_000).allowed, true);
});

test("verification quota caps client-wide attempts across changing numbers", () => {
  const consume = use("consumeWhatsAppQuota");
  for (let i = 0; i < 20; i++) assert.equal(consume("verify", `+6391712360${String(i).padStart(2, "0")}`, "shared-verify-client", NOW).allowed, true);
  assert.deepEqual(consume("verify", "+639171236099", "shared-verify-client", NOW), { allowed: false, retryAfter: 600 });
  assert.equal(consume("verify", "+639171236099", "shared-verify-client", NOW + 600_000).allowed, true);
});

test("quota rejects malformed identifiers and times", () => {
  const consume = use("consumeWhatsAppQuota");
  for (const args of [["send", "local-number", "client", NOW], ["send", PHONE, "", NOW], ["send", PHONE, "x".repeat(10_000), NOW], ["other", PHONE, "client", NOW], ["send", PHONE, "client", NaN]]) {
    assert.deepEqual(consume(...args), { allowed: false, retryAfter: 600 });
  }
});

test("quota bounds active identity storage and recovers capacity after expiry", () => {
  const consume = use("consumeWhatsAppQuota");
  const started = NOW + 1_200_000;
  for (let i = 0; i < 5_000; i++) {
    assert.equal(consume("send", `+1415${String(i).padStart(7, "0")}`, `capacity-client-${i}`, started).allowed, true);
  }
  assert.deepEqual(consume("send", "+14159999999", "capacity-overflow-client", started), { allowed: false, retryAfter: 600 });
  assert.equal(consume("send", "+14150000000", "capacity-client-0", started + 60_000).allowed, true);
  assert.equal(consume("send", "+14159999999", "capacity-overflow-client", started + 600_000).allowed, true);
});
