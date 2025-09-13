import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../lib/auth";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/types/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  environment: z.string(),
  framework: z.string(),
  modelType: z.string(),
  earningsSplit: z.number().min(0).max(100).optional(),
  isPublic: z.boolean().optional(),
  longDescription: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

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

    // Save file to local storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Parse and validate product data
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [],
      version: formData.get('version') as string || '1.0.0',
      environment: formData.get('environment') as string || 'production',
      framework: formData.get('framework') as string || 'default',
      modelType: formData.get('modelType') as string || 'default',
      earningsSplit: Number(formData.get('earningsSplit')) || 0,
      isPublic: formData.get('isPublic') === 'true',
      longDescription: formData.get('longDescription') as string || '',
      requirements: (formData.get('requirements') as string)?.split(',').map(req => req.trim()) || [],
    };

    const validatedData = productSchema.parse(productData);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        fileUrl: `/uploads/${fileName}`,
        createdBy: session.user.id,
        requirements: validatedData.requirements || [],
        status: 'draft',
        accessLevel: 'public',
        licenseType: 'free',
        environment: validatedData.environment,
        framework: validatedData.framework,
        version: validatedData.version || '1.0.0',
        modelType: validatedData.modelType,
        earningsSplit: validatedData.earningsSplit || 0
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error uploading product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to upload product' }, { status: 500 });
  }
} 