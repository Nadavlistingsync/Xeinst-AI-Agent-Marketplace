import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { productId, buyerId } = await req.json();
  const { data, error } = await supabase
    .from('purchases')
    .insert([{ product_id: productId, buyer_id: buyerId }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ purchase: data[0] });
} 