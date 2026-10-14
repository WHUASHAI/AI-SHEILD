# Social sign-in implementation plan

Goal: Replace the placeholder provider buttons with Google, Facebook, GitHub OAuth and WhatsApp phone verification, issuing real sessions after successful authentication.

Architecture: Auth.js handles OAuth, CSRF protection, encrypted cookie sessions, and sign-out. WhatsApp uses Twilio Verify and a short-lived signed challenge binding the browser to the phone and verification request. The application database stays disabled. External provider credentials must be supplied by the project owner before activation.

## Constraints

- Follow installed Next.js 16.2.12 documentation, including `proxy.ts` and asynchronous request APIs.
- Retain the email-first/password screens, four provider buttons, existing theme, and reduced-motion-aware slide.
- Never simulate login, expose credentials, save passwords, or send real verification messages during tests.
- Keep the existing email/password endpoint explicit about its unconfigured state; configuring account/password storage is outside this provider-login task.

## Tasks

- [x] Test provider configuration checks and safe redirects using Node's test runner, then implement `src/lib/auth-settings.ts`.
- [x] Test and implement `src/lib/whatsapp.ts`: input validation, send/check requests, signed expiring challenge, throttling, and controlled upstream errors. This task has separate file ownership and can run alongside provider wiring.
- [x] Configure `src/lib/auth.ts`, the Auth.js route handler, WhatsApp request endpoint, and local auth secret.
- [x] Connect social buttons to Auth.js and WhatsApp verification UI; show safe callback errors and sign-out.
- [x] Enforce authenticated access in the dashboard layout/proxy and scanning/report APIs, without enabling database persistence.
- [x] Document each required environment variable and exact callback URL in `docs/authentication-setup.md`; update the project index.
- [x] Run security-focused unit tests, changed-file lint, TypeScript, production build, and desktop/mobile browser checks; obtain code review.
- [ ] Activate and test live providers after the project owner supplies OAuth credentials and configures the Twilio WhatsApp sender/service.

Verification: 33 Node tests passed, including Auth.js session checks rejecting placeholder/legacy-key cookies and canonical origin checks behind a proxy. Changed authentication files passed ESLint; TypeScript and the production build passed. Edge/Playwright at `http://localhost:3000` verified desktop (1440 × 1000) and mobile (390 × 844) behavior, provider initiation using controlled UI responses, WhatsApp validation/cooldown/error states, private route enforcement, encrypted test-session access, sign-out, and rejection of forged/expired cookies. The Browser plugin was unavailable. Review findings about secret fallback and reverse-proxy origins were fixed and re-reviewed without remaining substantial findings. Existing build warnings about the inferred workspace root and `metadataBase` remain.

## Activation and testing limits

Final console check: the documented Next.js 16 `data-scroll-behavior="smooth"` attribute was added to the root layout to resolve its route-transition warning. The production build passed again. The browser console/runtime check passed with only the expected HTTP 503 for unconfigured WhatsApp. The root layout's pre-existing unused `ThemeProviderWrapper` import remains a lint warning; authentication files have no lint errors or warnings.

Live provider approval, account consent, WhatsApp delivery, and real OTP completion cannot be verified until valid credentials and provider account configuration exist. Tests use controlled provider responses. Process-local throttling is supplemental; distributed production deployments need shared or provider-managed limits.

## Follow-up: verified password sign-in and stricter provider checks

The user's follow-up requires the Sign In button and all providers to reject fake/unverified login attempts. Password sign-in now reads existing verified accounts through a separate lazy Prisma connection, while scan persistence stays disabled. No account is created during login and no verification timestamp is set from submitted data.

- [x] Replace the email/password placeholder with Auth.js credential authentication, salted scrypt verification, rate limits, and verified-email checks.
- [x] Require a confirmed client session and a freshly issued server session cookie before reporting successful password sign-in.
- [x] Require Google's verified OIDC email, GitHub's authenticated verified email records, Facebook's matching provider ID, and WhatsApp's approved verification result.
- [x] Reject old/unverified session claims and remove the fake verification-email/resend UI.
- [x] Add the optional Prisma password-hash field and prepare additive SQL without mutating the unreachable database.
- [x] Test the installed Auth.js profile conversion, CSRF/credential/session flow, independent OAuth user IDs, mixed-case emails, and false-success header regression.
- [x] Complete review and fix both substantive findings; 50 tests, authentication-file ESLint, TypeScript, production build, and desktop/mobile Edge/Playwright checks pass.
- [ ] Activate live OAuth/Twilio services and password accounts after the owner supplies credentials and a real account database. New password-account enrollment still requires a real verification/mail service.

Browser checks use `http://localhost:3000`, 1440x1000 and 390x844 viewports, and the Playwright fallback because the Browser plugin is unavailable. They confirm the password button responds, missing providers do not create sessions, the custom API rejects foreign origins/malformed input/verification-flag/header attacks, forged cookies cannot access any scan API, and email sending is never simulated. No real or demo accounts were created. Console checks show only the expected rejected setup request and existing social-sharing metadata warning. Live account approval/delivery and a real database-backed password login remain unverified.

## Later change: remove GitHub sign-in

At the user's request, GitHub was removed from all shared account buttons, backend providers/verification, readiness output, and current setup documentation. Old GitHub sessions are rejected. Google, WhatsApp, Facebook, and verified password authentication remain. Verification: 48 tests, TypeScript, scoped ESLint, and desktop/mobile checks on sign-in, password, and sign-up passed; the remaining WhatsApp navigation works. Provider credentials and the account database still require live setup.

## Later change: country-code selection and provider robustness

Added a left-side searchable WhatsApp dropdown with 245 country/territory codes, default Philippines (+63), local-number parsing, automatic country selection on international paste, shared-code entries, and short-region number support. The request endpoint validates phone metadata; the UI requires confirmed sends and verified sessions. Facebook profile requests now check status, refuse redirects, time out, and allow valid accounts with no photo/email. Google remains on Auth.js with its verified-email requirement. No identity/fake-profile detector is claimed: OAuth proves account control.

The focused review found one accessibility association problem with cmdk-generated IDs. The trigger now controls the named popover; cmdk owns its search/list IDs. Browser checks verify both associations, a scrollable full list, keyboard selection, mobile layout, local/international formatting, unconfirmed send rejection, and rejection of a successful-looking callback without a real session. No provider credentials or demo accounts were invented and no live messages were sent. OAuth/Twilio credentials remain the activation dependency.
