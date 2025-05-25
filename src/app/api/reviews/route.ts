import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(full_name)
      `)
      .eq('product_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, rating, comment } = await request.json();

    if (!agentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating or missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this agent
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', agentId)
      .eq('user_id', session.user.email)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this agent' },
        { status: 400 }
      );
    }

    // Create the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: agentId,
          user_id: session.user.email,
          rating,
          comment,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 