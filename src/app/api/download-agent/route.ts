import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Read the file from local storage
    const filePath = join(process.cwd(), 'public', product.file_url);
    const fileBuffer = await readFile(filePath);

    // Update download count
    await db
      .update(products)
      .set({ download_count: product.download_count + 1 })
      .where(eq(products.id, id));

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${product.name}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error downloading agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 