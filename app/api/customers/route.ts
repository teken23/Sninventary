
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(customers || []);
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body || {};

    const customer = await prisma.customer.create({
      data: {
        name: name || '',
        phone: phone || null,
        email: email || null,
        address: address || null,
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 });
  }
}
