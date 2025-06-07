import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
      include: {
        product: {
          select: {
            accessLevel: true,
            createdBy: true
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Check access based on product's access level
    if (file.product?.accessLevel !== 'public' && file.product?.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      download: searchParams.get('download') === 'true',
      preview: searchParams.get('preview') === 'true'
    };

    fileQuerySchema.parse(queryParams);

    // Get file content from storage
    // TODO: Implement file content retrieval from storage (e.g., file system, S3, etc.)
    return NextResponse.json(
      { error: 'File content retrieval not implemented' },
      { status: 501 }
    );
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

    const errorResponse = createErrorResponse(error);
    const errorData = await errorResponse.json();
    return NextResponse.json(
      { message: errorData.message },
      { status: errorData.statusCode }
    );
  }
} 