import { prisma } from './prisma';

export interface FraudDetectionResult {
  isFraudulent: boolean;
  confidence: number; // 0-1 scale
  reasons: string[];
  riskScore: number; // 0-100 scale
}

export interface ReviewData {
  userId: string;
  agentId: string;
  rating: number;
  comment: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ReviewFraudDetection {
  /**
   * Analyze a review for potential fraud
   */
  static async analyzeReview(reviewData: ReviewData): Promise<FraudDetectionResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for self-reviews
    const agent = await prisma.agent.findUnique({
      where: { id: reviewData.agentId },
      select: { createdBy: true }
    });

    if (agent && agent.createdBy === reviewData.userId) {
      reasons.push('Self-review detected');
      riskScore += 50;
    }

    // Check for duplicate reviews from same user
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: reviewData.userId,
        agentId: reviewData.agentId
      }
    });

    if (existingReview) {
      reasons.push('Duplicate review from same user');
      riskScore += 30;
    }

    // Check for suspicious rating patterns
    const userReviews = await prisma.review.findMany({
      where: { userId: reviewData.userId },
      select: { rating: true }
    });

    if (userReviews.length > 0) {
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      
      // Check for extreme rating bias
      if (reviewData.rating === 5 && avgRating > 4.5) {
        reasons.push('Consistent high ratings pattern');
        riskScore += 15;
      } else if (reviewData.rating === 1 && avgRating < 2) {
        reasons.push('Consistent low ratings pattern');
        riskScore += 15;
      }
    }

    // Check for rapid review posting
    const recentReviews = await prisma.review.findMany({
      where: {
        userId: reviewData.userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentReviews.length >= 5) {
      reasons.push('Rapid review posting detected');
      riskScore += 25;
    }

    // Check for comment patterns
    if (reviewData.comment) {
      const commentLength = reviewData.comment.length;
      
      // Very short or very long comments
      if (commentLength < 10) {
        reasons.push('Suspiciously short comment');
        riskScore += 10;
      } else if (commentLength > 1000) {
        reasons.push('Unusually long comment');
        riskScore += 5;
      }

      // Check for repetitive text
      const words = reviewData.comment.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const repetitionRatio = uniqueWords.size / words.length;
      
      if (repetitionRatio < 0.3 && words.length > 20) {
        reasons.push('Repetitive text detected');
        riskScore += 20;
      }

      // Check for common spam patterns
      const spamPatterns = [
        /click here/i,
        /buy now/i,
        /free money/i,
        /make money/i,
        /work from home/i,
        /bitcoin/i,
        /crypto/i,
        /investment/i
      ];

      for (const pattern of spamPatterns) {
        if (pattern.test(reviewData.comment)) {
          reasons.push('Spam keywords detected');
          riskScore += 30;
          break;
        }
      }
    }

    // Check for IP-based patterns (if IP provided)
    if (reviewData.ipAddress) {
      const ipReviews = await prisma.review.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        select: { userId: true }
      });

      // Count unique users from same IP
      const uniqueUsers = new Set(ipReviews.map(r => r.userId));
      if (uniqueUsers.size > 10) {
        reasons.push('Multiple users from same IP');
        riskScore += 20;
      }
    }

    // Check for new user patterns
    const user = await prisma.user.findUnique({
      where: { id: reviewData.userId },
      select: { createdAt: true }
    });

    if (user) {
      const userAge = Date.now() - user.createdAt.getTime();
      const userAgeHours = userAge / (1000 * 60 * 60);
      
      if (userAgeHours < 1) {
        reasons.push('New user posting review immediately');
        riskScore += 15;
      }
    }

    // Calculate confidence and final result
    const confidence = Math.min(riskScore / 100, 1);
    const isFraudulent = riskScore >= 50; // Threshold for flagging as fraudulent

    return {
      isFraudulent,
      confidence,
      reasons,
      riskScore: Math.min(riskScore, 100)
    };
  }

  /**
   * Get fraud statistics for an agent
   */
  static async getAgentFraudStats(agentId: string) {
    const reviews = await prisma.review.findMany({
      where: { agentId },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    });

    let suspiciousCount = 0;
    let totalRiskScore = 0;

    for (const review of reviews) {
      const fraudResult = await this.analyzeReview({
        userId: review.userId,
        agentId: review.agentId,
        rating: review.rating,
        comment: review.comment
      });

      if (fraudResult.isFraudulent) {
        suspiciousCount++;
      }
      totalRiskScore += fraudResult.riskScore;
    }

    return {
      totalReviews: reviews.length,
      suspiciousReviews: suspiciousCount,
      averageRiskScore: reviews.length > 0 ? totalRiskScore / reviews.length : 0,
      fraudPercentage: reviews.length > 0 ? (suspiciousCount / reviews.length) * 100 : 0
    };
  }

  /**
   * Get user fraud statistics
   */
  static async getUserFraudStats(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: {
        rating: true,
        comment: true,
        agentId: true,
        createdAt: true
      }
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingVariance: 0,
        suspiciousPatterns: []
      };
    }

    const ratings = reviews.map(r => r.rating);
    const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    
    // Calculate rating variance
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - averageRating, 2), 0) / ratings.length;
    
    // Check for suspicious patterns
    const suspiciousPatterns: string[] = [];
    
    // All 5-star reviews
    if (ratings.every(r => r === 5)) {
      suspiciousPatterns.push('All 5-star reviews');
    }
    
    // All 1-star reviews
    if (ratings.every(r => r === 1)) {
      suspiciousPatterns.push('All 1-star reviews');
    }
    
    // Very low variance (all similar ratings)
    if (variance < 0.5) {
      suspiciousPatterns.push('Very consistent ratings');
    }

    return {
      totalReviews: reviews.length,
      averageRating,
      ratingVariance: variance,
      suspiciousPatterns
    };
  }

  /**
   * Moderate a review based on fraud detection
   */
  static async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag', reason?: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Update review status (you might want to add a status field to the Review model)
    // For now, we'll create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: `review_${action}`,
        targetType: 'review',
        targetId: reviewId,
        meta: {
          reason,
          reviewRating: review.rating,
          reviewComment: review.comment?.substring(0, 100)
        }
      }
    });

    return { success: true, action, reason };
  }
}

