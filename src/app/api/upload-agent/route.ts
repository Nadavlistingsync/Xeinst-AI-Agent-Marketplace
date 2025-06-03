import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const modelType = formData.get('modelType') as string;
    const framework = formData.get('framework') as string;
    const environment = formData.get('environment') as string;
    const source = formData.get('source') as string;

    if (!file || !name || !description || !modelType || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save file to local storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        name: name,
        description: description,
        accessLevel: 'public',
        licenseType: 'open-source',
        environment: environment || 'production',
        framework: framework,
        modelType: modelType,
        source: source,
        deployedBy: session.user.id,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ deployment });
  } catch (error) {
    console.error('Error uploading agent:', error);
    return NextResponse.json(
      { error: 'Failed to upload agent' },
      { status: 500 }
    );
  }
} 