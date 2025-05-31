import { prisma } from './db';
import { File } from '@prisma/client';

export async function uploadFile(
  file: File,
  userId: string
): Promise<string> {
  const fileRecord = await prisma.file.create({
    data: {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedBy: userId,
      path: '', // This will be updated after actual upload
    },
  });

  // Here you would implement the actual file upload logic
  // For example, using AWS S3, Google Cloud Storage, etc.
  const fileUrl = `/api/files/${fileRecord.id}`;

  // Update the file record with the URL
  await prisma.file.update({
    where: { id: fileRecord.id },
    data: { path: fileUrl },
  });

  return fileUrl;
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

export async function listFiles(userId: string): Promise<File[]> {
  return prisma.file.findMany({
    where: { uploadedBy: userId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export function getFileUrl(fileId: string) {
  return `/api/files/${fileId}`;
} 