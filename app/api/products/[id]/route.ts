
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '@/lib/s3';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params?.id || '' }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priceDOP = parseFloat(formData.get('priceDOP') as string);
    const costUSD = parseFloat(formData.get('costUSD') as string);
    const stock = parseInt(formData.get('stock') as string);
    const imageFile = formData.get('image') as File | null;
    const existingImage = formData.get('existingImage') as string;

    let imageUrl = existingImage;

    if (imageFile && imageFile.size > 0) {
      if (existingImage) {
        try {
          await deleteFile(existingImage);
        } catch (e) {
          console.error('Error deleting old image:', e);
        }
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `products/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadFile(buffer, fileName);
    }

    const product = await prisma.product.update({
      where: { id: params?.id || '' },
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
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params?.id || '' }
    });

    if (product?.image) {
      try {
        await deleteFile(product.image);
      } catch (e) {
        console.error('Error deleting image:', e);
      }
    }

    await prisma.product.delete({
      where: { id: params?.id || '' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Error deleting product' }, { status: 500 });
  }
}
