import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';
import prisma from '@/lib/prisma';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided or invalid file type' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(filePath, buffer);

    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        url: `/api/files/${uuidv4()}`,
        uploadedBy: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: fileRecord
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('fileKey');
    if (!fileKey) {
      return NextResponse.json({ error: 'No file key provided' }, { status: 400 });
    }

    await deleteFile(fileKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
} 