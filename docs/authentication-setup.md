# Google sign-in on Vercel

Google is the only social sign-in provider. Facebook has been removed from the UI, provider registration, and accepted sessions. Existing verified password accounts remain supported separately.

## Required Vercel environment variables

Set these for the **Production** environment of the Vercel project that builds this repository's root directory (the directory containing `package.json` and `src/`):

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | An independently generated random secret, at least 32 characters. This is not the Google client secret. |
| `AUTH_GOOGLE_ID` | Google OAuth Web application client ID, usually ending in `.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | The matching Google OAuth client secret |
| `AUTH_URL` | The exact public origin users open, such as `https://your-app.vercel.app` or your custom domain |

The app also accepts the pair `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. If either `AUTH_GOOGLE_*` value is present, that family takes priority; configure the complete matching pair and remove stale values. Surrounding whitespace in Google credentials is trimmed. Do not expose secrets through `NEXT_PUBLIC_*` variables.

Generate the app session secret locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`AUTH_SECRET` is required for authentication. There is no built-in fallback session signing key. Google sign-in uses encrypted HTTP-only JWT cookies and does not require a PostgreSQL database, Resend, Twilio, or a pre-created local user.

`REQUIRE_AUTH=true` additionally requires a session for dashboard and scan/report APIs. Leave its current setting unchanged if guest scanning is intended.

## Google Cloud configuration

Create/use an OAuth client with application type **Web application**. In Google Auth Platform / Credentials, register:

- Authorized JavaScript origin: the public origin, without a path.
- Authorized redirect URI: `https://YOUR-EXACT-DOMAIN/api/auth/callback/google`.

Use the actual domain, not the literal example above. The redirect URI must match exactly, including protocol, hostname, and path. Register custom domains and any separate preview host that needs sign-in individually. A changing Vercel preview URL will not match a production-only callback.

For public access with ordinary Google accounts, configure the consent audience as **External** and publish the app to **Production**. If it remains in **Testing**, add each permitted account as a test user. An **Internal** audience restricts sign-in to the configured Google Workspace organization. Follow any Google verification requirements shown for the app; do not add extra scopes beyond the default identity/profile/email scopes for this flow.

After changing Vercel variables, **redeploy**. Updating variables does not change an already-built deployment. Remove a stale `NEXTAUTH_URL` pointing to localhost or an old domain, and set `AUTH_URL` to the origin used for the live test.

References: [Auth.js Google provider](https://authjs.dev/reference/core/providers/google), [Auth.js deployment](https://authjs.dev/getting-started/deployment), [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google production readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance).

## What was fixed

- Google configuration now resolves both supported variable naming families consistently for readiness checks and provider registration.
- Google and verified-password sessions enter the dashboard directly. A second app email-confirmation gate previously redirected valid Google users to `/verify-email` and depended on another email service/database.
- The legacy email-verification page now wraps `useSession()` in `SessionProvider`, preventing its missing-context crash.
- Sign-in/sign-up and the landing-page scan-choice dialog share the same Google button and error handling.
- Facebook UI, provider implementation, and session acceptance were removed. Old Facebook sessions are rejected.
- Session setup fails on a missing/invalid `AUTH_SECRET` instead of using a hardcoded key.
- The readiness command works with inherited Vercel variables even when `.env.local` does not exist, prints the callback without credentials, and exits unsuccessfully for missing Google setup or an invalid production origin.

Google's validated OIDC profile must contain a matching subject and email with `email_verified === true`. No email typed into a form, query parameter, confirmation cookie, or client session update grants Google authentication.

## Verify the deployed flow

1. Open `https://YOUR-EXACT-DOMAIN/api/auth/providers`. It should list `google` and should not list Facebook. This endpoint returns public provider metadata, not secrets.
2. Open `/sign-in`, then click **Continue with Google**. The browser should navigate to Google's account chooser.
3. Choose a real account and complete consent. It should return through `/api/auth/callback/google` to `/dashboard`, without asking for another confirmation email.
4. Reload and verify the session persists, then sign out and verify it clears.
5. Repeat from the landing-page **Start Scanning** dialog and from a mobile viewport. Test cancellation too.

Troubleshooting:

| Symptom | Check |
| --- | --- |
| Providers endpoint omits Google | Missing/invalid `AUTH_SECRET`, missing credential pair, wrong Vercel environment/project, or deployment not rebuilt |
| Google `redirect_uri_mismatch` | Register the exact callback for the domain currently in the browser; remove stale localhost app URLs |
| Google access blocked / only selected accounts work | External audience, publishing status, test users, and any Workspace restrictions |
| Google `invalid_client` | Web client ID and matching secret; ensure a different credential family is not overriding them |
| App `Configuration` error | Vercel function logs and required environment variables; do not share secret values |
| Still sees Facebook or extra email-confirmation redirect | The live deployment is running older source; redeploy this change |

## Local checks

```powershell
npm.cmd ci
npm.cmd run auth:check
npm.cmd test
npm.cmd run build
```

`auth:check` reads `.env.local` if present and otherwise uses inherited variables. It checks configuration shape; it cannot establish Google client validity, Google audience permissions, live callback registration, or actual account consent.

Password-account lookup requires a real configured PostgreSQL database, existing verified account records, and salted scrypt hashes. Signup and password-reset enrollment remain placeholders and are separate from Google OAuth.

## Verification of this change (21 October 2026)

- Nineteen targeted checks passed: Google credential configuration, readiness diagnostics, redirects, session-cookie proof, email-token signatures, and dashboard access decisions.
- The dashboard regression was reproduced against the original source: an authenticated Google session without a separate confirmation record was redirected to email verification. Updated source renders the dashboard, while missing sessions still redirect when authentication is required.
- Syntax checks passed for all seven changed TypeScript/TSX files using an available TypeScript 5.9.3 compiler. This was not a full type check.
- The full test command recorded 19 passing checks and three test-file failures: `auth-security.test.mjs`, `password-auth.test.mjs`, and `provider-verification.test.mjs` could not import the missing `@auth/core` dependency. The dashboard checks used an existing local TypeScript installation via `NODE_PATH`; no dependency versions were changed in this project.
- `npm ci` could not download packages because outbound registry access was denied; an offline retry also lacked the required cached packages. The production build could not start because `next` is not installed.
- Browser QA and real Google account consent were not performed. No deployment or Vercel environment changes were made, and no live site URL was provided during the change.
