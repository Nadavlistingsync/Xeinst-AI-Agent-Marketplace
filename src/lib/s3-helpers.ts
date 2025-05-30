import { v4 as uuidv4 } from 'uuid';

export async function uploadToS3(file: File, key: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
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
    const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
} 