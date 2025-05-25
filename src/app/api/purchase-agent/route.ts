import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }
    // Check if already purchased
    const { data: existing } = await supabase
      .from('purchases')
      .select('*')
      .eq('product_id', product_id)
      .eq('user_id', session.user.email)
      .single();
    if (existing) {
      return NextResponse.json({ success: true, alreadyPurchased: true });
    }
    // Insert purchase
    const { error } = await supabase
      .from('purchases')
      .insert([
        {
          product_id,
          user_id: session.user.email,
          status: 'completed',
        },
      ]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 