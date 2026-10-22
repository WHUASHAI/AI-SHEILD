import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { hasGuestAccess } from '@/lib/guest-access';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (await hasGuestAccess()) return <DashboardShell>{children}</DashboardShell>;
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  // Both Google and password sign-in already require a verified email before issuing a session.
  if (!session?.user) {
    redirect('/sign-in');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
