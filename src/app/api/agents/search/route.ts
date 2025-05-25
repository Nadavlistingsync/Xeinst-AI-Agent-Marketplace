import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'newest';

    let supabaseQuery = supabase
      .from('products')
      .select('*')
      .eq('is_public', true);

    // Apply text search
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,tag.ilike.%${query}%`
      );
    }

    // Apply category filter
    if (category && category !== 'All') {
      supabaseQuery = supabaseQuery.eq('tag', category);
    }

    // Apply price filters
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte('price', parseFloat(maxPrice));
    }

    // Apply rating filter
    if (minRating) {
      supabaseQuery = supabaseQuery.gte('average_rating', parseFloat(minRating));
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: true });
        break;
      case 'price_asc':
        supabaseQuery = supabaseQuery.order('price', { ascending: true });
        break;
      case 'price_desc':
        supabaseQuery = supabaseQuery.order('price', { ascending: false });
        break;
      case 'rating':
        supabaseQuery = supabaseQuery.order('average_rating', { ascending: false });
        break;
      default: // newest
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
    }

    const { data: agents, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error searching agents:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
} 