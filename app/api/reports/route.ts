
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'sales') {
      const invoices = await prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const salesByDay: Record<string, number> = {};
      
      invoices?.forEach((inv) => {
        const date = new Date(inv?.createdAt || '').toLocaleDateString('es-DO');
        salesByDay[date] = (salesByDay?.[date] || 0) + (inv?.totalDOP || 0);
      });

      const chartData = Object.entries(salesByDay || {})?.map(([date, total]) => ({
        date,
        total
      }));

      return NextResponse.json(chartData || []);
    }

    if (type === 'top-products') {
      const orderItems = await prisma.orderItem.findMany({
        include: {
          product: true
        }
      });

      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

      orderItems?.forEach((item) => {
        const productId = item?.productId || '';
        const productName = item?.product?.name || '';
        
        if (!productSales[productId]) {
          productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
        }

        productSales[productId].quantity += item?.quantity || 0;
        productSales[productId].revenue += (item?.priceDOP || 0) * (item?.quantity || 0);
      });

      const topProducts = Object.values(productSales || {})
        ?.sort((a, b) => (b?.quantity || 0) - (a?.quantity || 0))
        ?.slice(0, 10);

      return NextResponse.json(topProducts || []);
    }

    if (type === 'customers-debt') {
      const customers = await prisma.customer.findMany({
        where: { balance: { gt: 0 } },
        orderBy: { balance: 'desc' }
      });

      return NextResponse.json(customers || []);
    }

    if (type === 'low-stock') {
      const products = await prisma.product.findMany({
        where: { stock: { lte: 1 } },
        orderBy: { stock: 'asc' }
      });

      return NextResponse.json(products || []);
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json({ error: 'Error fetching report data' }, { status: 500 });
  }
}
