
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppLayout } from '@/components/app-layout';
import CustomersContent from './customers-content';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <AppLayout>
      <CustomersContent />
    </AppLayout>
  );
}
