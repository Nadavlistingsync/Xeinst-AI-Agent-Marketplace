import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initSocket } from '@/lib/websocket';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const io = initSocket(req as any);
    if (!io) {
      return new NextResponse('Failed to initialize socket', { status: 500 });
    }

    return new NextResponse('Socket initialized', { status: 200 });
  } catch (error) {
    console.error('Error initializing socket:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 