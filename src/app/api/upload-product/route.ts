import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Product } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import slugify from 'slugify';
import { uploadProduct } from '@/lib/upload';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const productUrl = await uploadProduct(file, session.user.id);
    return NextResponse.json({ productUrl });
  } catch (error) {
    console.error('Error uploading product:', error);
    return NextResponse.json({ error: 'Failed to upload product' }, { status: 500 });
  }
} 