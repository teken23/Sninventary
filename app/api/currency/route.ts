
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getExchangeRate } from '@/lib/currency';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let config = await prisma.currencyConfig.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (!config) {
      const rate = await getExchangeRate();
      config = await prisma.currencyConfig.create({
        data: {
          usdToDOP: rate,
        }
      });
    }

    const hoursSinceUpdate = config?.updatedAt 
      ? (Date.now() - new Date(config.updatedAt).getTime()) / (1000 * 60 * 60)
      : 24;

    if (hoursSinceUpdate > 24) {
      const newRate = await getExchangeRate();
      config = await prisma.currencyConfig.update({
        where: { id: config?.id || '' },
        data: { usdToDOP: newRate }
      });
    }

    return NextResponse.json({
      rate: config?.usdToDOP || 58.5,
      lastUpdated: config?.updatedAt || new Date()
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json({ rate: 58.5, lastUpdated: new Date() });
  }
}

export async function POST() {
  try {
    const newRate = await getExchangeRate();
    
    const config = await prisma.currencyConfig.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    let updated;
    if (config?.id) {
      updated = await prisma.currencyConfig.update({
        where: { id: config.id },
        data: { usdToDOP: newRate }
      });
    } else {
      updated = await prisma.currencyConfig.create({
        data: { usdToDOP: newRate }
      });
    }

    return NextResponse.json({
      rate: updated?.usdToDOP || newRate,
      lastUpdated: updated?.updatedAt || new Date()
    });
  } catch (error) {
    console.error('Currency update error:', error);
    return NextResponse.json({ error: 'Error updating exchange rate' }, { status: 500 });
  }
}
