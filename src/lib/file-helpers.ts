import { prisma } from './db';
import { File } from '@prisma/client';

export async function uploadFile(
  file: File,
  user_id: string
): Promise<string> {
  const fileRecord = await prisma.file.create({
    data: {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedBy: user_id,
      path: '', // This will be updated after actual upload
    },
  });

  // Here you would implement the actual file upload logic
  // For example, using AWS S3, Google Cloud Storage, etc.
  const file_url = `/api/files/${fileRecord.id}`;

  // Update the file record with the URL
  await prisma.file.update({
    where: { id: fileRecord.id },
    data: { path: file_url },
  });

  return file_url;
}

export async function getFile(id: string): Promise<File | null> {
  return prisma.file.findUnique({
    where: { id },
  });
}

export async function deleteFile(id: string): Promise<File> {
  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Here you would implement the actual file deletion logic
  // For example, deleting from AWS S3, Google Cloud Storage, etc.

  return prisma.file.delete({
    where: { id },
  });
}

export async function listFiles(user_id: string): Promise<File[]> {
  return prisma.file.findMany({
    where: { uploadedBy: user_id },
    orderBy: {
      created_at: 'desc',
    },
  });
}

export function getFileUrl(fileId: string) {
  return `/api/files/${fileId}`;
} 