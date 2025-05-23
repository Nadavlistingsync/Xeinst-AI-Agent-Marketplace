import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProductDetails from './ProductDetails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  model_type: string;
  framework: string;
  price: number;
  download_count: number;
  created_at: string;
  file_path: string;
  user_id: string;
  features: string[];
  requirements: string[];
  usage_instructions: string;
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (productError) {
    throw new Error('Failed to load product details');
  }

  let isPurchased = false;
  if (session?.user?.email) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('product_id', product.id)
      .eq('user_id', session.user.email)
      .eq('status', 'completed')
      .single();
    
    isPurchased = !!purchase;
  }

  return <ProductDetails product={product} isPurchased={isPurchased} />;
} 