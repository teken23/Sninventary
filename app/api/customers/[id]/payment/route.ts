
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount, method, notes } = body || {};

    const customer = await prisma.customer.findUnique({
      where: { id: params?.id || '' }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const payment = await prisma.payment.create({
      data: {
        customerId: params?.id || '',
        amount: parseFloat(amount) || 0,
        method: method || 'efectivo',
        notes: notes || null,
      }
    });

    await prisma.customer.update({
      where: { id: params?.id || '' },
      data: {
        balance: Math.max(0, (customer?.balance || 0) - (parseFloat(amount) || 0))
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment POST error:', error);
    return NextResponse.json({ error: 'Error recording payment' }, { status: 500 });
  }
}
