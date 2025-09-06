import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withEnhancedErrorHandling(async () => {
    const { id } = params;

    if (!id) {
      throw new EnhancedAppError(
        'Web embed ID is required',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'MISSING_WEB_EMBED_ID',
        null,
        false,
        undefined,
        'Please provide a valid web embed ID',
        ['Check the URL', 'Ensure the ID is correct', 'Try browsing from the main page']
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
      throw new EnhancedAppError(
        'Web embed not found',
        404,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.LOW,
        'WEB_EMBED_NOT_FOUND',
        null,
        false,
        undefined,
        'The requested web embed could not be found',
        ['Check the URL', 'Browse available web embeds', 'Contact support if needed']
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
  }, { endpoint: `/api/web-embeds/${params.id}`, method: 'GET' });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withEnhancedErrorHandling(async () => {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      throw new EnhancedAppError(
        'Web embed ID is required',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'MISSING_WEB_EMBED_ID',
        null,
        false,
        undefined,
        'Please provide a valid web embed ID',
        ['Check the URL', 'Ensure the ID is correct']
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
  }, { endpoint: `/api/web-embeds/${params.id}`, method: 'PUT' });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withEnhancedErrorHandling(async () => {
    const { id } = params;

    if (!id) {
      throw new EnhancedAppError(
        'Web embed ID is required',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'MISSING_WEB_EMBED_ID',
        null,
        false,
        undefined,
        'Please provide a valid web embed ID',
        ['Check the URL', 'Ensure the ID is correct']
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
  }, { endpoint: `/api/web-embeds/${params.id}`, method: 'DELETE' });
} 