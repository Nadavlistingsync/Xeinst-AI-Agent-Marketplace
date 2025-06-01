import { NextResponse } from 'next/server';
import { getFile } from '@/lib/file-helpers';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const fileQuerySchema = z.object({
  download: z.boolean().optional(),
  preview: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate file ID
    if (!z.string().uuid().safeParse(params.fileId).success) {
      return NextResponse.json(
        { error: 'Invalid file ID format' },
        { status: 400 }
      );
    }

    // Check if user has access to the file
    const fileAccess = await prisma.fileAccess.findFirst({
      where: {
        fileId: params.fileId,
        userId: session.user.id
      }
    });

    if (!fileAccess) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      download: searchParams.get('download') === 'true',
      preview: searchParams.get('preview') === 'true'
    };

    const validatedParams = fileQuerySchema.parse(queryParams);

    const file = await getFile(params.fileId);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(file.data, 'base64');

    // Set appropriate headers based on query parameters
    const headers: Record<string, string> = {
      'Content-Type': file.type,
    };

    if (validatedParams.download) {
      headers['Content-Disposition'] = `attachment; filename="${file.name}"`;
    } else if (validatedParams.preview) {
      headers['Content-Disposition'] = 'inline';
    }

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error downloading file:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to download file');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 