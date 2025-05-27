import { NextResponse } from 'next/server';
import { getFile } from '@/lib/file-helpers';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const file = await getFile(params.fileId);
    const buffer = Buffer.from(file.data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 