
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices || []);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Error fetching invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, paidAmount } = body || {};

    const order = await prisma.order.findUnique({
      where: { id: orderId || '' },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const totalDOP = order?.totalDOP || 0;
    const paid = parseFloat(paidAmount) || totalDOP;
    const balanceDue = Math.max(0, totalDOP - paid);

    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: orderId || '',
        customerId: order?.customerId || '',
        totalDOP,
        paymentMethod: paymentMethod || 'efectivo',
        paidAmount: paid,
        balanceDue
      },
      include: {
        customer: true,
        order: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (balanceDue > 0) {
      await prisma.customer.update({
        where: { id: order?.customerId || '' },
        data: {
          balance: {
            increment: balanceDue
          }
        }
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Invoices POST error:', error);
    return NextResponse.json({ error: 'Error creating invoice' }, { status: 500 });
  }
}
