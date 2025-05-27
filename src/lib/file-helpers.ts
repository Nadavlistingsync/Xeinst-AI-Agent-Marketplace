import { db } from './db';
import { files } from './schema';
import { eq } from 'drizzle-orm';

export async function uploadFile(file: File, userId: string) {
  try {
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    const [uploadedFile] = await db.insert(files).values({
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64Data,
      uploaded_by: userId,
    }).returning();

    return uploadedFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function getFile(fileId: string) {
  try {
    const [file] = await db.select().from(files).where(eq(files.id, fileId));
    if (!file) {
      throw new Error('File not found');
    }
    return file;
  } catch (error) {
    console.error('Error getting file:', error);
    throw new Error('Failed to get file');
  }
}

export async function deleteFile(fileId: string) {
  try {
    await db.delete(files).where(eq(files.id, fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

export function getFileUrl(fileId: string) {
  return `/api/files/${fileId}`;
} 