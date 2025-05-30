import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { unlink } from 'fs/promises';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function uploadToS3(file: File, key: string): Promise<string> {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  return `/uploads/${key}`;
}

export async function getS3SignedUrl(key: string): Promise<string> {
  return `/uploads/${key}`;
}

export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const filePath = join(UPLOAD_DIR, key);
    await unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
} 