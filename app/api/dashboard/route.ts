
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      pendingOrders,
      customersWithDebt,
      lowStockProducts,
      todayInvoices,
      monthInvoices
    ] = await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: ['Pendiente de preparar', 'Listo para enviar']
          }
        }
      }),
      prisma.customer.findMany({
        where: { balance: { gt: 0 } }
      }),
      prisma.product.count({
        where: { stock: { lte: 1 } }
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: today } }
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: startOfMonth } }
      })
    ]);

    const totalDebt = customersWithDebt?.reduce((sum, c) => sum + (c?.balance || 0), 0) || 0;
    const todaySales = todayInvoices?.reduce((sum, inv) => sum + (inv?.totalDOP || 0), 0) || 0;
    const monthSales = monthInvoices?.reduce((sum, inv) => sum + (inv?.totalDOP || 0), 0) || 0;

    return NextResponse.json({
      pendingOrders: pendingOrders || 0,
      customersWithDebt: customersWithDebt?.length || 0,
      totalDebt,
      lowStockProducts: lowStockProducts || 0,
      todaySales,
      monthSales
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Error fetching dashboard stats' }, { status: 500 });
  }
}
