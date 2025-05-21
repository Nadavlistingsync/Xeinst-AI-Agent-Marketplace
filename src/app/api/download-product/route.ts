import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const { productId } = await req.json();

  // TODO: Check if user has purchased the product (implement purchase check logic)

  // Get product info
  const { data: product, error } = await supabase
    .from('products')
    .select('file_url')
    .eq('id', productId)
    .single();

  if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Generate signed URL
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('products')
    .createSignedUrl(product.file_url, 60 * 10); // 10 minutes

  if (signedUrlError) return NextResponse.json({ error: signedUrlError.message }, { status: 500 });

  return NextResponse.json({ url: signedUrlData.signedUrl });
} 