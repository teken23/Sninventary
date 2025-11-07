
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppLayout } from '@/components/app-layout';
import OrdersContent from './orders-content';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <AppLayout>
      <OrdersContent />
    </AppLayout>
  );
}
