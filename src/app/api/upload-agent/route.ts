import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import stream from 'stream';

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
    const category = formData.get('category') as string;
    const price = formData.get('price') as string;
    const documentation = formData.get('documentation') as string;

    if (!file || !name || !description || !category || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are allowed' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await createDirIfNotExists(uploadsDir);

    // Generate unique filename
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Create agent in database
    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        documentation,
        fileUrl: `/uploads/${fileName}`,
        createdBy: session.user.id,
        isPublic: true,
        version: '1.0.0',
        environment: 'production',
        framework: 'custom',
        modelType: 'custom'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: agent.id,
        name: agent.name,
        fileUrl: agent.fileUrl
      } 
    });

  } catch (error) {
    console.error('Error uploading agent:', error);
    return NextResponse.json(
      { error: 'Failed to upload agent' },
      { status: 500 }
    );
  }
}

async function createDirIfNotExists(dir: string) {
  try {
    await writeFile(dir, '', { flag: 'wx' });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
} 