
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadFile } from '@/lib/s3';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priceDOP = parseFloat(formData.get('priceDOP') as string);
    const costUSD = parseFloat(formData.get('costUSD') as string);
    const stock = parseInt(formData.get('stock') as string);
    const imageFile = formData.get('image') as File | null;

    let imageUrl = '';

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `products/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadFile(buffer, fileName);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        category,
        priceDOP,
        costUSD,
        stock,
        image: imageUrl || null,
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
