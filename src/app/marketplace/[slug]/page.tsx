import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProductDetails from './ProductDetails';
import { getProductBySlug } from '@/lib/db-helpers';

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

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <ProductDetails 
      product={product as Product} 
      user={session?.user} 
    />
  );
} 