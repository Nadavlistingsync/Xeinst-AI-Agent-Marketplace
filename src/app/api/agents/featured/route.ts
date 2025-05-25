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
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured agents' },
      { status: 500 }
    );
  }
} 