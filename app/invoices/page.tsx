
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppLayout } from '@/components/app-layout';
import InvoicesContent from './invoices-content';

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <AppLayout>
      <InvoicesContent />
    </AppLayout>
  );
}
