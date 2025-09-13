import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
// import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from "../../../../lib/enhanced-error-handling";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Web embed ID is required' },
        { status: 400 }
      );
    }

    const webEmbed = await prisma.webEmbed.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!webEmbed) {
      return NextResponse.json(
        { success: false, error: 'Web embed not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.webEmbed.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastViewed: new Date()
      }
    });

    // Log the view
    await prisma.webEmbedLog.create({
      data: {
        embedId: id,
        action: 'view',
        metadata: {
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      webEmbed
    });
  } catch (error) {
    console.error('GET /api/web-embeds/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch web embed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Web embed ID is required' },
        { status: 400 }
      );
    }

    const webEmbed = await prisma.webEmbed.update({
      where: { id },
      data: body,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      webEmbed
    });
  } catch (error) {
    console.error('PUT /api/web-embeds/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update web embed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Web embed ID is required' },
        { status: 400 }
      );
    }

    // Delete associated logs first
    await prisma.webEmbedLog.deleteMany({
      where: { embedId: id }
    });

    // Delete the web embed
    await prisma.webEmbed.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Web embed deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/web-embeds/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete web embed' },
      { status: 500 }
    );
  }
} 