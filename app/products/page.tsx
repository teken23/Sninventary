
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppLayout } from '@/components/app-layout';
import ProductsContent from './products-content';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <AppLayout>
      <ProductsContent />
    </AppLayout>
  );
}
