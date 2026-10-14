# Activate provider sign-in

The application now has real Auth.js integration for Google and Facebook, a WhatsApp verification flow backed by Twilio Verify, and email/password sign-in for existing verified PostgreSQL accounts. Successful authentication creates an encrypted HTTP-only cookie session lasting up to seven days. The dashboard, scanning APIs, and private report API require that session. Sign-out clears it.

**Provider credentials are still missing in this workspace. These services cannot authenticate real accounts until you complete the provider-side setup below.** A secure local `AUTH_SECRET` has been generated. Keep secrets in `.env.local`; do not paste them into chat or commit them.

The current PostgreSQL address is also a placeholder and its hostname does not resolve. Password sign-in cannot authenticate real users until the account database and verified records exist. No demo users or passwords are created.

The selected authentication library is **NextAuth/Auth.js**, which is already installed and wired to the provider buttons. A different authentication library would still require registered Google/Meta applications and a WhatsApp verification service. For live provider login, complete the Google/Facebook app registration below and fill the matching `AUTH_*` values in `.env.local`; then configure Twilio Verify for WhatsApp. Provider login does not require the password database.

## 1. Use one app address

The current local setting is `AUTH_URL="http://localhost:3000"`. Open the app using **http://localhost:3000** and use that exact origin in each provider console. `localhost` and `127.0.0.1` are different cookie hosts; mixing them breaks OAuth callback checks.

When deploying, change `AUTH_URL` to the site's HTTPS address, set a strong production `AUTH_SECRET`, and register the corresponding HTTPS callback URLs. WhatsApp validates browser requests against this configured public origin, including behind a reverse proxy, and requires HTTPS in production. Without a configured URL, its fallback is limited to local development loopback addresses. To generate a new secret in another checkout, follow [Auth.js installation guidance](https://authjs.dev/getting-started/installation), including `npx auth secret`.

## 2. Register the OAuth apps

| Provider | Environment variables | Local callback URL |
| --- | --- | --- |
| Google | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | `http://localhost:3000/api/auth/callback/google` |
| Facebook | `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`, `AUTH_FACEBOOK_API_VERSION` | `http://localhost:3000/api/auth/callback/facebook` |

### Google

1. Open [Google Cloud credentials](https://console.cloud.google.com/apis/credentials), select or create a project, and configure its OAuth consent/branding and audience.
2. Create an OAuth client for a **Web application**.
3. Add `http://localhost:3000` as the authorized JavaScript origin and the Google callback URL above as the authorized redirect URI.
4. Put its client ID and secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
5. If the app is in testing mode, add the Google accounts that will test it to its allowed test users.

See [the Auth.js Google setup](https://authjs.dev/getting-started/providers/google).

### Facebook

1. Create or select an application in [Meta for Developers](https://developers.facebook.com/apps/) with Facebook Login enabled.
2. Add the Facebook callback URL above to its valid OAuth redirect URIs. Use the app's development configuration for localhost; public access depends on Meta's applicable app/publication requirements.
3. Put the app ID and app secret into `AUTH_FACEBOOK_ID` and `AUTH_FACEBOOK_SECRET`.
4. Set `AUTH_FACEBOOK_API_VERSION` to a **supported Graph API version shown for your app**, using the `vNN.N` format. This deliberately avoids the older version hardcoded in the installed Auth.js provider.
5. In development mode, test with an app administrator/developer/tester account that Meta permits for that application.

See [the Auth.js Facebook setup](https://authjs.dev/getting-started/providers/facebook).

## 3. Configure WhatsApp verification

WhatsApp sign-in proves control of a phone number using a six-digit code; it does not use a Google-style OAuth account picker. This implementation uses [Twilio Verify WhatsApp](https://www.twilio.com/docs/verify/whatsapp).

The phone screen now has a searchable country-code dropdown on the **left** of the number field. It contains **245 countries and territories** from `libphonenumber-js`, including separate entries for countries sharing a calling code. The default is Philippines (+63). Search by country name, two-letter region, or dialing code; keyboard selection is supported. The list is [maintained by the phone-number library](https://github.com/catamphetamine/libphonenumber-js#getcountries-string).

Enter a national number such as `09171234567`, or paste `+639171234567`. The app handles regional trunk prefixes, preserves Italy's significant leading zero, and automatically selects the country for a recognized full international number. Both client and request endpoint validate number metadata, including short-number territories such as Tokelau. Valid number formatting does not prove that a WhatsApp account exists: successful Twilio code verification is still required. Actual delivery depends on Twilio/WhatsApp channel availability for the destination.

1. Create/select your Twilio account and a Verify service.
2. Complete Twilio's required WhatsApp sender onboarding and connect your own WhatsApp sender to the Verify service. A Verify service alone is insufficient for WhatsApp delivery.
3. Configure the Verify service to use **six-digit codes** and the WhatsApp channel. This app sends only via WhatsApp and does not silently switch to SMS.
4. Set these values in `.env.local`:

```dotenv
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_VERIFY_SERVICE_SID=""
```

5. For a trial account, follow Twilio's restrictions for permitted destination numbers. Test with a WhatsApp number you control, entered in international form such as `+639171234567`.

WhatsApp verification requests use your Twilio account and may incur its normal fees. No real messages were sent during implementation tests.

The flow validates an international number, requests a code, binds a signed five-minute HTTP-only challenge cookie to that number and the exact Twilio verification SID, and checks the code with Twilio. The UI opens the code screen only after a successful `sent: true` response. Auth.js creates a session only after Twilio returns an approved result for the matching phone, SID, and WhatsApp channel, and the client confirms that session before opening the dashboard. Incorrect/expired codes and successful-looking responses without a session never authenticate.

## 4. Password sign-in with verified accounts

The Sign In button on `/sign-in/password` now uses Auth.js credentials authentication and confirms that a real session exists before opening the dashboard. It accepts only an existing database record with a matching salted scrypt password hash and a valid `emailVerified` timestamp. Unknown accounts, incorrect passwords, missing hashes, and unverified records are denied. Verification flags sent by the browser are ignored.

1. Replace the placeholder `DATABASE_URL` with a working PostgreSQL connection for your account database. The connection is scoped to `src/lib/auth-db.ts`; existing scan persistence in `src/lib/db.ts` stays disabled.
2. Initialize the `User` table using the repository's Prisma schema if this is a new account database. For an existing database already matching the old schema, review and apply `prisma/verified-password-column.sql` to add the optional `passwordHash` column. No database/schema mutation was performed during implementation because the configured host cannot be reached.
3. Use `hashPassword()` in `src/lib/password-auth.ts` inside a trusted account-enrollment/password-management backend to store hashes, never plaintext. Its fixed `scrypt-v1` format uses a random 16-byte salt and scrypt with N=32768, r=8, p=1, and a 64-byte output.
4. Store account emails normalized to lowercase. Set `emailVerified` only after a trusted process actually proves email ownership. This sign-in implementation never sets that timestamp from login input or auto-creates users.

**New password-account registration, email delivery, and password recovery still need a real enrollment/verification service.** The existing sign-up API does not create accounts, and the verification screen no longer pretends to send verification emails. Existing verified accounts can sign in once the database/schema/hash requirements are satisfied; new users can use configured provider sign-in meanwhile.

The password verifier permits up to five attempts per account and twenty per client in ten minutes, with bounded process-local counters. Missing/invalid hashes still perform scrypt work before rejection, and responses avoid distinguishing nonexistent from unverified or incorrect-password accounts.

## 5. Check configuration and test live

After entering credentials, restart the development server and run:

```powershell
npm.cmd run auth:check
npm.cmd run dev
```

`auth:check` prints readiness and callback URLs without printing credentials. The test/check scripts use Node's native TypeScript support and require Node 22.18+ or Node 24; this workspace uses Node 24.

At `http://localhost:3000/sign-in`, test each configured provider, its cancel/failure path, successful dashboard access, sign-out, and rejection of dashboard/API access after sign-out. For WhatsApp, test real delivery, correct and incorrect codes, expiry, and resending. For passwords, test a verified stored account with its correct password and rejection of wrong passwords, unverified accounts, and nonexistent accounts.

## Protection and deployment limits

- Auth.js provides OAuth state/PKCE where appropriate, CSRF checks, encrypted sessions, and same-origin safe redirects.
- Google requires `email_verified === true` in its validated OIDC profile. See [Google's OIDC claims](https://developers.google.com/identity/openid-connect/openid-connect).
- Facebook requires matching IDs from its authenticated provider profile; it does not supply an equivalent email-verification claim. The Graph profile request checks HTTP status, times out after ten seconds, refuses redirects, and hides upstream error details. An email address or profile photo is optional and cannot prevent a valid provider account from signing in. WhatsApp accepts only Twilio approval for the browser-bound phone/SID. These prove account control, rather than a person's real-world identity or whether someone used an invented profile name.
- Only successful trusted authentication marks newly issued sessions as verified. Legacy sessions without that marker are rejected; users must sign in again after this change. Client session-update data cannot set the marker.
- Missing, short, and placeholder `AUTH_SECRET` values fail before Auth.js loads environment defaults. Legacy or rotation environment keys do not replace the explicitly validated primary session key.
- The Next.js proxy checks protected routes. Dashboard rendering and individual scan/report handlers independently verify sessions before private work.
- WhatsApp requests require a same-origin JSON POST; challenge cookies are HTTP-only, SameSite=Lax, and Secure on HTTPS. Provider/OTP error details are not exposed.
- Supplemental per-process limits allow at most one send per minute and three sends per ten minutes per number, ten sends per ten minutes per client, and five verification attempts per ten minutes per number. Buckets expire and total in-memory storage is bounded.
- **For distributed/serverless production, configure shared or provider-managed rate limits**: process-local counters do not coordinate across workers or restarts. Follow [Twilio's service rate-limit guidance](https://www.twilio.com/docs/verify/api/service-rate-limits).
- Scan persistence remains disabled. The separate account-database connection reads existing verified password records; cross-provider linking and password-account enrollment/management are not enabled. Existing dashboard/admin data remains sample data, and none of it serves as login credentials.
- Unit tests use controlled Twilio responses, and browser QA can verify session enforcement with local test fixtures. These do not establish live OAuth account approval or real WhatsApp delivery.
