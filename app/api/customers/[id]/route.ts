
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params?.id || '' },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer GET error:', error);
    return NextResponse.json({ error: 'Error fetching customer' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body || {};

    const customer = await prisma.customer.update({
      where: { id: params?.id || '' },
      data: {
        name: name || '',
        phone: phone || null,
        email: email || null,
        address: address || null,
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer PUT error:', error);
    return NextResponse.json({ error: 'Error updating customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params?.id || '' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({ error: 'Error deleting customer' }, { status: 500 });
  }
}
