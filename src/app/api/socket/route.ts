import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { initializeSocket } from '@/lib/socket';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const socketQuerySchema = z.object({
  reconnect: z.boolean().optional(),
  forceNew: z.boolean().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      reconnect: searchParams.get('reconnect') === 'true',
      forceNew: searchParams.get('forceNew') === 'true'
    };

    const validatedParams = socketQuerySchema.parse(queryParams);

    const socket = await initializeSocket(session.user.id);

    if (!socket) {
      return NextResponse.json(
        { message: 'Socket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      socket,
      metadata: {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
        options: validatedParams
      }
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    
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