import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const createWebEmbedSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  url: z.string().url(),
  embedUrl: z.string().url(),
  type: z.enum(['website', 'application', 'dashboard', 'tool', 'custom']).default('website'),
  width: z.string().default('100%'),
  height: z.string().default('600px'),
  allowFullscreen: z.boolean().default(true),
  allowScripts: z.boolean().default(false),
  sandbox: z.string().default('allow-same-origin allow-scripts allow-forms allow-popups'),
  allowedDomains: z.array(z.string()).default([]),
  blockedDomains: z.array(z.string()).default([]),
  requireAuth: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const limiter = await rateLimit(req);
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const validatedData = createWebEmbedSchema.parse(body);

    const webEmbed = await prisma.webEmbed.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(webEmbed);
  } catch (error) {
    console.error('Error creating web embed:', error);
    return NextResponse.json(
      { error: 'Failed to create web embed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {
      status: 'active',
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (userId) where.createdBy = userId;

    const webEmbeds = await prisma.webEmbed.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.webEmbed.count({ where });

    return NextResponse.json({
      webEmbeds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching web embeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch web embeds' },
      { status: 500 }
    );
  }
} 