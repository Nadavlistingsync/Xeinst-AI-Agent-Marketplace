import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { File } from '@prisma/client';

export async function uploadFile(file: { name: string; size: number; type: string; arrayBuffer: () => Promise<ArrayBuffer> }, userId: string) {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueId = uuidv4();
  const fileName = `${uniqueId}-${file.name}`;
  const filePath = join(uploadDir, fileName);
  const fileUrl = `/uploads/${fileName}`;

  await writeFile(filePath, buffer);

  const savedFile = await prisma.file.create({
    data: {
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      url: fileUrl,
      uploadedBy: userId
    }
  });

  return savedFile;
}

export async function getFile(fileId: string) {
  return prisma.file.findUnique({
    where: { id: fileId }
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
      createdAt: 'desc',
    },
  });
}

export function getFileUrl(fileId: string) {
  return `/api/files/${fileId}`;
} 