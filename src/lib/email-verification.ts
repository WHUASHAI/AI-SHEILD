import crypto from 'crypto';

export const CONFIRMED_EMAIL_COOKIE = 'aishield_email_confirmed';

function getSecret(): string {
  return process.env.AUTH_SECRET || 'ai-shield-fallback-secure-secret-minimum-32-chars-long';
}

export function createVerificationToken(email: string, secret = getSecret()): string {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${normalizedEmail}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function verifyVerificationToken(token: string, secret = getSecret()): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };
    const [email, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);
    if (!email || isNaN(expiresAt) || Date.now() > expiresAt) return { valid: false };

    const expected = crypto.createHmac('sha256', secret).update(`${email}:${expiresAt}`).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }
    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export function createConfirmedCookieValue(email: string, secret = getSecret()): string {
  const normalizedEmail = email.trim().toLowerCase();
  const signature = crypto.createHmac('sha256', secret).update(`confirmed:${normalizedEmail}`).digest('hex');
  return `${normalizedEmail}:${signature}`;
}

export function isConfirmedCookieValid(cookieValue: string | undefined, secret = getSecret()): string | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(':');
  if (parts.length !== 2) return null;
  const [email, signature] = parts;
  if (!email || !signature) return null;
  try {
    const expected = crypto.createHmac('sha256', secret).update(`confirmed:${email.toLowerCase()}`).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return email.toLowerCase();
    }
  } catch {
    return null;
  }
  return null;
}

export async function isEmailConfirmed(email: string, cookieVal?: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  // 1. Check HTTP-only confirmation cookie
  try {
    let val = cookieVal;
    if (!val) {
      const nextHeaders = await import('next/headers').catch(() => null);
      if (nextHeaders?.cookies) {
        const cookieStore = await nextHeaders.cookies();
        val = cookieStore.get(CONFIRMED_EMAIL_COOKIE)?.value;
      }
    }
    const verifiedEmail = isConfirmedCookieValid(val);
    if (verifiedEmail && verifiedEmail === normalized) {
      return true;
    }
  } catch {
    // cookies() might not be accessible outside of request context
  }

  // 2. Check PostgreSQL database if configured
  try {
    const authSettings = await import('./auth-settings').catch(() => null);
    if (authSettings?.getPasswordDatabaseUrl?.()) {
      const authDb = await import('./auth-db').catch(() => null);
      if (authDb?.findPasswordAccount) {
        const account = await authDb.findPasswordAccount(normalized);
        if (account?.emailVerified) {
          return true;
        }
      }
    }
  } catch {
    // Ignore database connectivity issues
  }

  return false;
}

export async function sendVerificationEmail(
  toEmail: string,
  appUrl: string,
): Promise<{ success: boolean; error?: string; previewUrl?: string }> {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const token = createVerificationToken(normalizedEmail);
  const verifyLink = `${appUrl.replace(/\/$/, '')}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('[email] RESEND_API_KEY is not configured. Verification link:', verifyLink);
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured in environment variables.',
      previewUrl: verifyLink,
    };
  }

  const fromEmail = process.env.EMAIL_FROM || 'Elucid AI <onboarding@resend.dev>';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm your Elucid AI Account</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050d18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050d18; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 560px; background: #0b1728; border: 1px solid #1e3a5f; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="font-size: 24px; font-weight: bold; color: #60a5fa; letter-spacing: -0.5px;">
                      <img src="${appUrl.replace(/\/$/, '')}/brand/elucid-ai-lens.png" alt="Elucid AI Logo" width="48" height="48" style="display: block; margin: 0 auto 12px; border: 0;" />
                      Elucid AI
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; text-align: center;">
                      Confirm your Google Sign-In
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px; color: #94a3b8; font-size: 15px; line-height: 24px; text-align: center;">
                    Hello! You recently signed in with Google using <strong style="color: #cbd5e1;">${normalizedEmail}</strong>. Please confirm your email address to activate your account and start using the Elucid AI detection dashboard.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <a href="${verifyLink}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
                      Confirm & Open Dashboard →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px; color: #64748b; font-size: 13px; line-height: 20px; text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                    This confirmation link will expire in 24 hours.<br/>
                    If you did not initiate this sign-in, you can safely ignore this email.
                  </td>
                </tr>
                <tr>
                  <td style="color: #475569; font-size: 11px; text-align: center;">
                    If the button doesn't work, copy and paste this link into your browser:<br/>
                    <a href="${verifyLink}" style="color: #3b82f6; word-break: break-all;">${verifyLink}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [normalizedEmail],
        subject: 'Confirm your Elucid AI Account',
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[resend-error]', data);
      return { success: false, error: data.message || 'Failed to send confirmation email' };
    }
    return { success: true };
  } catch (err) {
    console.error('[resend-fetch-error]', err);
    return { success: false, error: 'Could not connect to email delivery service' };
  }
}
