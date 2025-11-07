
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items } = body || {};

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item?.productId || '' }
      });

      if (!product) {
        return NextResponse.json({ error: `Product ${item?.productId} not found` }, { status: 404 });
      }

      if ((product?.stock || 0) < (item?.quantity || 0)) {
        return NextResponse.json({ 
          error: `Stock insuficiente para ${product?.name}` 
        }, { status: 400 });
      }

      const itemTotal = (product?.priceDOP || 0) * (item?.quantity || 0);
      total += itemTotal;

      orderItems.push({
        productId: product?.id || '',
        quantity: item?.quantity || 0,
        priceDOP: product?.priceDOP || 0,
      });

      await prisma.product.update({
        where: { id: product?.id || '' },
        data: {
          stock: (product?.stock || 0) - (item?.quantity || 0)
        }
      });
    }

    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerId || '',
        totalDOP: total,
        status: 'Pendiente de preparar',
        items: {
          create: orderItems
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}
