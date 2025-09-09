import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { prisma } from './db';
import { v4 as uuidv4 } from 'uuid';

// Temporary file storage for webhook-based agents
const TEMP_UPLOAD_DIR = join(process.cwd(), 'temp', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for webhook payloads

export async function uploadTempFile(
  file: File, 
  userId: string, 
  agentId?: string
): Promise<{ fileId: string; path: string }> {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const fileId = uuidv4();
    const uniqueFilename = `${fileId}-${file.name}`;
    const filepath = join(TEMP_UPLOAD_DIR, uniqueFilename);
    
    // Ensure directory exists
    await writeFile(filepath, buffer);
    
    // Store in database with expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.file.create({
      data: {
        id: fileId,
        name: file.name,
        path: filepath,
        type: file.type,
        size: file.size,
        url: `/uploads/${fileId}`,
        uploadedBy: userId,
        productId: agentId || null
      }
    });
    
    return { fileId, path: filepath };
  } catch (error) {
    console.error('Error uploading temp file:', error);
    throw new Error('Failed to upload temporary file');
  }
}

export async function getTempFileContent(fileId: string): Promise<Buffer | null> {
  try {
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!fileRecord) {
      return null;
    }

    return await readFile(fileRecord.path);
  } catch (error) {
    console.error('Error reading temp file:', error);
    return null;
  }
}

export async function deleteTempFile(fileId: string): Promise<void> {
  try {
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!fileRecord) {
      return;
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
  } catch (error) {
    console.error('Error deleting temp file:', error);
    throw new Error('Failed to delete temporary file');
  }
}

export async function cleanupExpiredFiles(): Promise<number> {
  try {
    // Since File model doesn't have expiration, return 0 for now
    // In a real implementation, you might want to add expiration logic
    console.log('File cleanup skipped - no expiration logic implemented');
    return 0;
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
    return 0;
  }
}

export async function uploadProduct(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  fileUrl: string;
  user_id: string;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        fileUrl: data.fileUrl,
        createdBy: data.user_id,
        uploadedBy: data.user_id,
        isPublic: true,
        version: '1.0.0',
        environment: 'production',
        framework: 'custom',
        modelType: 'general',
        earningsSplit: 0.8,
      },
    });

    return product;
  } catch (error) {
    console.error('Error uploading product:', error);
    throw new Error('Failed to upload product');
  }
} 