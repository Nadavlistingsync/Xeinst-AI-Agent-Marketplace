import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { deploymentId: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this deployment
    const existingReview = await prisma.review.findFirst({
      where: {
        deploymentId: params.id,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this deployment" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || "",
        deploymentId: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update deployment rating
    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        rating: true,
        totalRatings: true,
      },
    });

    if (deployment) {
      const newTotalRatings = deployment.totalRatings + 1;
      const newRating = ((deployment.rating * deployment.totalRatings) + rating) / newTotalRatings;

      await prisma.deployment.update({
        where: { id: params.id },
        data: {
          rating: newRating,
          totalRatings: newTotalRatings,
        },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewId, rating, comment } = await request.json();

    // Check if user owns the review
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment || existingReview.comment,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update deployment rating
    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        rating: true,
        totalRatings: true,
      },
    });

    if (deployment) {
      const newRating = ((deployment.rating * deployment.totalRatings) - existingReview.rating + rating) / deployment.totalRatings;

      await prisma.deployment.update({
        where: { id: params.id },
        data: {
          rating: newRating,
        },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewId } = await request.json();

    // Check if user owns the review
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update deployment rating
    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        rating: true,
        totalRatings: true,
      },
    });

    if (deployment && deployment.totalRatings > 1) {
      const newTotalRatings = deployment.totalRatings - 1;
      const newRating = ((deployment.rating * deployment.totalRatings) - existingReview.rating) / newTotalRatings;

      await prisma.deployment.update({
        where: { id: params.id },
        data: {
          rating: newRating,
          totalRatings: newTotalRatings,
        },
      });
    } else if (deployment) {
      await prisma.deployment.update({
        where: { id: params.id },
        data: {
          rating: 0,
          totalRatings: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
} 