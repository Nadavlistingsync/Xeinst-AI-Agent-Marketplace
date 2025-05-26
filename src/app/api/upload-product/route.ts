import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const category = formData.get('category') as string;
  const uploader_id = formData.get('uploader_id') as string;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  try {
    // Save file to local storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Insert product metadata into DB
    const [product] = await db
      .insert(products)
      .values({
        name,
        description,
        price: parseFloat(price),
        category,
        uploaded_by: uploader_id,
        file_url: `/uploads/${fileName}`,
      })
      .returning();

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error uploading product:', error);
    return NextResponse.json(
      { error: 'Failed to upload product' },
      { status: 500 }
    );
  }
} 