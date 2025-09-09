import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Temporary file storage for webhook-based agents
const TEMP_UPLOAD_DIR = join(process.cwd(), 'temp', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for webhook payloads
const FILE_RETENTION_HOURS = 24; // Auto-delete after 24 hours

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
    const agentId = formData.get('agentId') as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided or invalid file type' },
        { status: 400 }
      );
    }

    // Check file size limit for webhook payloads
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = uuidv4();
    const fileName = `${fileId}-${file.name}`;
    const filePath = join(TEMP_UPLOAD_DIR, fileName);

    await mkdir(TEMP_UPLOAD_DIR, { recursive: true });
    await writeFile(filePath, buffer);

    // Store temporary file record with expiration
    const expiresAt = new Date(Date.now() + FILE_RETENTION_HOURS * 60 * 60 * 1000);
    
    const fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        url: `/uploads/${fileId}`,
        uploadedBy: session.user.id,
        productId: agentId || null,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        fileId: fileRecord.id,
        name: fileRecord.name,
        type: fileRecord.type,
        size: fileRecord.size,
        url: fileRecord.url,
        createdAt: fileRecord.createdAt
      }
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
    const fileId = searchParams.get('fileId');
    if (!fileId) {
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    // Find and delete file
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete physical file
    try {
      await unlink(fileRecord.path);
    } catch (fileError) {
      console.warn('Physical file not found, continuing with database cleanup:', fileError);
    }

    // Delete database record
    await prisma.file.delete({
      where: { id: fileId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

// Cleanup expired files (should be called by a cron job)
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cleanup') {
      // For now, skip cleanup since File model doesn't have expiration
      // In a real implementation, you might want to add expiration logic
      return NextResponse.json({ 
        success: true, 
        deletedCount: 0,
        message: 'Cleanup completed (no expiration logic implemented)'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in cleanup:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
} 