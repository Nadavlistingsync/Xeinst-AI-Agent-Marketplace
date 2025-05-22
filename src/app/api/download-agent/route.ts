import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, status')
      .eq('product_id', productId)
      .eq('user_id', session.user.id)
      .single();

    if (purchaseError || !purchase || purchase.status !== 'completed') {
      return NextResponse.json(
        { error: 'Purchase not found or incomplete' },
        { status: 403 }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('file_url, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('deployments')
      .createSignedUrl(product.file_url, 60); // URL expires in 60 seconds

    if (signedUrlError || !signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Increment download counter
    const { error: counterError } = await supabase.rpc('increment_download_count', {
      product_id: productId,
    });

    if (counterError) {
      console.error('Failed to increment download counter:', counterError);
    }

    return NextResponse.json({
      downloadUrl: signedUrl.signedUrl,
      fileName: product.name,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 