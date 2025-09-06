import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

const webEmbedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  embedUrl: z.string().url("Must be a valid embed URL"),
  type: z.enum(['website', 'application', 'dashboard', 'tool', 'custom']).default('tool'),
  width: z.string().default('100%'),
  height: z.string().default('600px'),
  allowFullscreen: z.boolean().default(true),
  allowScripts: z.boolean().default(false),
  sandbox: z.string().default('allow-same-origin allow-scripts allow-forms allow-popups'),
});

export async function GET() {
  return withEnhancedErrorHandling(async () => {
    const webEmbeds = await prisma.webEmbed.findMany({
      where: { status: 'active' },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      webEmbeds,
      total: webEmbeds.length
    });
  }, { endpoint: '/api/web-embeds', method: 'GET' });
}

export async function POST(request: NextRequest) {
  return withEnhancedErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new EnhancedAppError(
        'Authentication required',
        401,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        'AUTH_REQUIRED',
        null,
        false,
        undefined,
        'Please sign in to create a web embed',
        ['Sign in to your account', 'Check your credentials', 'Reset your password if needed']
      );
    }

    const body = await request.json();
    const validatedData = webEmbedSchema.parse(body);

    // Create the web embed
    const webEmbed = await prisma.webEmbed.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        url: validatedData.url,
        embedUrl: validatedData.embedUrl,
        type: validatedData.type,
        width: validatedData.width,
        height: validatedData.height,
        allowFullscreen: validatedData.allowFullscreen,
        allowScripts: validatedData.allowScripts,
        sandbox: validatedData.sandbox,
        status: 'active',
        createdBy: session.user.id,
      },
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
  }, { endpoint: '/api/web-embeds', method: 'POST' });
} 