// This file is server-only. Do not import in client components or pages.
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "./prisma";
import type { File } from '../types/prisma';

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

export async function getFileById(id: string): Promise<File | null> {
  return prisma.file.findUnique({
    where: {
      id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function getFilesByUser(userId: string): Promise<File[]> {
  return prisma.file.findMany({
    where: {
      uploadedBy: userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Remove getFilesByDeployment if File model does not have deploymentId
// export async function getFilesByDeployment(deploymentId: string): Promise<File[]> {
//   return prisma.file.findMany({
//     where: {
//       deploymentId
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });
// } 