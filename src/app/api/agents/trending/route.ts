import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: agents, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('downloads', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending agents' },
      { status: 500 }
    );
  }
} 