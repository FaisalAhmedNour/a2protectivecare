import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import { getSnapshot } from '@/server/repository';
import { AdminDashboard } from '@/components/admin/dashboard';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  if (!(await getSession())) redirect('/admin/login/');
  return <AdminDashboard initialData={await getSnapshot()} />;
}
