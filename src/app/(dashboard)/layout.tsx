import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { isEmailConfirmed } from '@/lib/email-verification';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  // If user is authenticated via Google or another provider, require email confirmation
  if (session?.user?.email) {
    const confirmed = await isEmailConfirmed(session.user.email);
    if (!confirmed) {
      redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
    }
  } else if (process.env.REQUIRE_AUTH === 'true') {
    redirect('/sign-in');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
