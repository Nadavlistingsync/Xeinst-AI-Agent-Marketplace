import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: agents, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('average_rating', { ascending: false })
      .limit(6);

    if (error) throw error;

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured agents' },
      { status: 500 }
    );
  }
} 