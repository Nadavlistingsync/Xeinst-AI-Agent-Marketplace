import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewFraudDetection } from '@/lib/review-fraud-detection';
import { AuditLogger } from '@/lib/audit-logger';
import { z } from 'zod';

const reviewSchema = z.object({
  agentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, rating, comment } = reviewSchema.parse(body);

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if user has already reviewed this agent
    const existingReview = await prisma.review.findFirst({
      where: {
        agentId: agentId,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this agent' 
      }, { status: 400 });
    }

    // Check if user has actually used this agent (optional validation)
    const hasUsedAgent = await prisma.creditTransaction.findFirst({
      where: {
        userId: session.user.id,
        agentId: agentId,
        type: 'spend'
      }
    });

    if (!hasUsedAgent) {
      return NextResponse.json({ 
        error: 'You must use an agent before reviewing it' 
      }, { status: 400 });
    }

    // Get client IP and user agent for fraud detection
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Run fraud detection
    const fraudResult = await ReviewFraudDetection.analyzeReview({
      userId: session.user.id,
      agentId: agentId,
      rating: rating,
      comment: comment || '',
      ipAddress,
      userAgent
    });

    // Log fraud detection result
    await AuditLogger.log({
      actorId: session.user.id,
      action: 'review_fraud_check',
      targetType: 'review',
      targetId: agentId,
      meta: {
        fraudResult,
        agentId,
        rating
      }
    });

    // If fraud is detected, handle accordingly
    if (fraudResult.isFraudulent) {
      // Log the suspicious review attempt
      await AuditLogger.log({
        actorId: session.user.id,
        action: 'suspicious_review_blocked',
        targetType: 'review',
        targetId: agentId,
        meta: {
          fraudResult,
          agentId,
          rating,
          comment: comment?.substring(0, 100)
        }
      });

      return NextResponse.json({
        error: 'Review flagged for review. Please contact support if you believe this is an error.',
        fraudDetected: true,
        reasons: fraudResult.reasons
      }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: rating,
        comment: comment,
        userId: session.user.id,
        agentId: agentId,
        deploymentId: agentId // Using agentId as deploymentId for compatibility
      }
    });

    // Update agent average rating
    const agentReviews = await prisma.review.findMany({
      where: { agentId: agentId }
    });

    const averageRating = agentReviews.reduce((sum, r) => sum + r.rating, 0) / agentReviews.length;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        // You might want to add a rating field to the Agent model
        // rating: averageRating
      }
    });

    // Log successful review creation
    await AuditLogger.log({
      actorId: session.user.id,
      action: 'review_created',
      targetType: 'review',
      targetId: review.id,
      meta: {
        agentId,
        rating,
        fraudRiskScore: fraudResult.riskScore
      }
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      },
      fraudCheck: {
        riskScore: fraudResult.riskScore,
        confidence: fraudResult.confidence
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create review' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const userId = searchParams.get('userId');
    const includeFraudStats = searchParams.get('includeFraudStats') === 'true';

    if (!agentId && !userId) {
      return NextResponse.json({ 
        error: 'Either agentId or userId must be provided' 
      }, { status: 400 });
    }

    const whereClause: any = {};
    if (agentId) whereClause.agentId = agentId;
    if (userId) whereClause.userId = userId;

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let fraudStats = null;
    if (includeFraudStats && agentId) {
      fraudStats = await ReviewFraudDetection.getAgentFraudStats(agentId);
    }

    return NextResponse.json({
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: review.user
      })),
      fraudStats
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reviews' 
    }, { status: 500 });
  }
}

