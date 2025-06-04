import { writeFile } from 'fs/promises';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { prisma } from './db';

export async function uploadFile(file: File, directory: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), 'public', directory, uniqueFilename);
    
    // Write the file
    await writeFile(filepath, buffer);
    
    return `/${directory}/${uniqueFilename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    const fullPath = join(process.cwd(), 'public', filepath);
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
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