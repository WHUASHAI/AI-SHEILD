import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (process.env.REQUIRE_AUTH === 'true') {
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }
    if (!session?.user) redirect('/sign-in');
  }
  return <DashboardShell>{children}</DashboardShell>;
}
