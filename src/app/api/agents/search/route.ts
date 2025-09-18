import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../../lib/db-check";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      const errorResponse = createDatabaseErrorResponse();
      return new Response(JSON.stringify(errorResponse), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Allow public access for search
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const searchTerms = query.split(' ').filter(Boolean);
    const where: any = searchTerms.length > 0 ? {
      OR: [
        ...searchTerms.map(term => ({
          name: {
            contains: term,
            mode: 'insensitive' as const
          }
        })),
        ...searchTerms.map(term => ({
          description: {
            contains: term,
            mode: 'insensitive' as const
          }
        })),
        ...searchTerms.map(term => ({
          category: {
            contains: term,
            mode: 'insensitive' as const
          }
        }))
      ]
    } : {};

    if (category && !searchTerms.length) {
      where.category = {
        contains: category,
        mode: 'insensitive' as const
      };
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviews: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { downloadCount: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.agent.count({ where })
    ]);

    // Format the response to match expected structure
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      price: agent.price,
      averageRating: agent.reviews.length > 0 
        ? agent.reviews.reduce((acc, review) => acc + review.rating, 0) / agent.reviews.length
        : 0,
      downloadCount: agent.downloadCount || 0,
      creator: agent.creator
    }));

    return new Response(JSON.stringify({
      agents: formattedAgents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || 
          error.message.includes('connect') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('timeout') ||
          error.message.includes('does not exist') ||
          error.message.includes('relation') ||
          error.message.includes('column') ||
          error.message.includes('DATABASE_URL') ||
          error.message.includes('Validation Error') ||
          error.message.includes('Error validating datasource')) {
        return new Response(JSON.stringify({ 
          error: 'Database connection error',
          message: 'Please check database configuration',
          timestamp: new Date().toISOString()
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to search agents',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 