# Google sign-in on Vercel

## Push and deployment checks (29 October 2026)

The repository pins Node.js **24.x** for Vercel and CI. Keep Vercel's framework preset as **Next.js**, build command as `npm run build`, install command as `npm ci`, and output directory at its framework default. The project root must contain `package.json`, `next.config.ts`, and `src/`.

`.github/workflows/checks.yml` runs a clean install, tests, and production build on pushes and pull requests. It checks the source independently; it does not block Vercel's Git integration or certify a real Google account login. The build now explicitly resolves its workspace root, including linked dependencies, and configures the social-image metadata base to remove the previous warnings.

Keep the existing **Production** Vercel authentication variables. The local `.env.local` is ignored by Git and is not uploaded through a GitHub push. For the current live domain, `AUTH_URL` must be `https://elucid-ai-scan.vercel.app`. The Google OAuth Web client must register `https://elucid-ai-scan.vercel.app/api/auth/callback/google` exactly.

The live domain was renamed to `elucid-ai-scan.vercel.app`. The first check after the rename found guest entry returning HTTP 403 and Google authorization still using the previous domain. Update the Vercel **Production** `AUTH_URL` to the origin above, update or remove any stale `NEXTAUTH_URL`, and redeploy. In the existing Google OAuth Web client, add the new origin under Authorized JavaScript origins and the exact new callback under Authorized redirect URIs. Keep the existing matching Google credentials and session secret. A domain rename does not replace the auth URLs stored in those settings.

After the new deployment is ready, run:

```powershell
npm.cmd run check:deployment -- https://elucid-ai-scan.vercel.app
```

This checks the Elucid AI public pages, Google provider availability, unauthenticated session handling, protected dashboard access, guest selection and refresh with secure cookies, and the Google authorization callback. It reports errors without printing credentials, CSRF tokens, or cookies. It deliberately fails if the deployment still serves older branding or missing public pages. Complete one real Google login afterward, refresh the dashboard, and sign out to verify account consent, token exchange, and session persistence.

Before this push, the existing live deployment accepted guest entry/refresh and reached Google's email-entry screen with the correct callback. It still served AI Shield branding and prefetched missing `/resources` and `/use-cases` pages. Those pages exist in the updated source, which must be pushed and redeployed before the new release can be checked live. Full real-account Google consent was not performed, and Vercel project settings/build logs were not available through a connected account.


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

Scanning requires either a real session or an explicit **Continue as Guest** choice in the landing-page dialog. `POST /api/guest` sets a separate guest-mode cookie; it never creates a Google session. Guest access covers scanning, overview, and recent history, while account settings/admin/API keys and private report APIs still require authentication. The former `REQUIRE_AUTH` flag does not silently open the dashboard. Requests without either access mode fail closed.

The public **Sign In** link always opens `/sign-in`, including when the browser already holds a valid session. Clicking **Continue with Google** clears guest mode and starts Google OAuth with `prompt=select_account`. Existing valid sessions still permit direct dashboard access; displaying the sign-in page does not silently sign a user out. The desktop/mobile header has only Sign In. Start Scanning remains in the landing-page content and opens Google and Guest choices.

Both modes keep only the latest 20 scans. Guest history is held in the current document's memory: client-side navigation preserves it, while refresh or closing the page clears it. Google history is stored in browser localStorage, separately for each account, so it survives refresh and reopening with the same account in the same browser. Clearing browser data removes it; no database or cross-device synchronization is claimed. Old sessionStorage guest records are discarded instead of restored.

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

6. In a private/incognito browser with neither session nor guest choice, open `/dashboard` directly: it must redirect to `/sign-in`. Choose Guest from the landing page, scan, and navigate to History. Only the latest 20 scans should remain. Refresh: guest history should be empty. Guest users must not access private reports/account tools. With an existing Google session, click the header **Sign In** link: the sign-in page must remain visible until the user chooses a sign-in method. Google history should remain after refresh and reopening in the same browser.

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
- The dashboard regression was reproduced against the original source: an authenticated Google session without a separate confirmation record was redirected to email verification. Updated source renders the dashboard, while missing sessions always redirect.
- Syntax checks passed for all seven changed TypeScript/TSX files using an available TypeScript 5.9.3 compiler. This was not a full type check.
- The full test command recorded 19 passing checks and three test-file failures: `auth-security.test.mjs`, `password-auth.test.mjs`, and `provider-verification.test.mjs` could not import the missing `@auth/core` dependency. The dashboard checks used an existing local TypeScript installation via `NODE_PATH`; no dependency versions were changed in this project.
- `npm ci` could not download packages because outbound registry access was denied; an offline retry also lacked the required cached packages. The production build could not start because `next` is not installed.
- Browser QA and real Google account consent were not performed. No deployment or Vercel environment changes were made, and no live site URL was provided during the change.

## Sign-in navigation and guest access regression (22 October 2026)

Two code paths reproduced the reported behavior: Auth.js redirected authenticated visits to `/sign-in` straight to `/dashboard`, and dashboard/API access was optional unless `REQUIRE_AUTH` was exactly `true`. Proxy authentication errors also previously continued the request. The updated code keeps sign-in visible, always protects private routes, and blocks private requests on auth failures. Header Start Scanning buttons and guest-entry shortcuts were removed.

Twenty-four targeted checks passed. The new routing and dashboard tests failed against the previous behavior before the fixes and pass afterward. The full suite still has three dependency-loading failures (`auth-security.test.mjs`, `password-auth.test.mjs`, `provider-verification.test.mjs`) because `@auth/core` is unavailable. The build cannot start without the missing `next` dependency. Live Google OAuth and browser interaction remain unverified; no live site URL was provided during this change.

## Google and Guest history behavior (22 October 2026)

The requested follow-up restores Guest as an explicit landing-page choice. It does not restore the previous implicit guest bypass or the header's extra Start Scanning button. An existing Google session does not skip the sign-in page, and choosing Guest never fabricates Google authentication.

The new shared history store is covered for the 20-scan limit, navigation, document reload, reopening an account, account isolation, corrupt saved data, subscriptions, and clearing history. Routing tests cover explicit guest access, denied private account/report access, guest entry when Google is unavailable, and same-origin guest-mode changes. Thirty-six targeted tests passed. Full build and live browser/Google OAuth checks remain blocked by the previously recorded missing dependencies; this change has not been deployed by the agent.
