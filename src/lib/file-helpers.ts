import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { unlink } from 'fs/promises';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function uploadFile(file: File, userId: string) {
  try {
    // Create uploads directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Write file to disk
    await writeFile(filePath, uint8Array);

    // Return the public URL path
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filePath: string) {
  try {
    const fullPath = join(process.cwd(), 'public', filePath);
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
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

export function getFileUrl(fileId: string) {
  return `/api/files/${fileId}`;
} 