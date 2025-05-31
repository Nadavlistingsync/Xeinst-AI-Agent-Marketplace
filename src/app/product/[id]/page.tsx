import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProduct } from '@/lib/product-helpers';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { AgentReviews } from '@/components/AgentReviews';
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ReviewSection } from "@/components/product/ReviewSection";
import { RelatedProducts } from "@/components/product/RelatedProducts";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getServerSession(authOptions);
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const isCreator = session?.user?.id === product.createdBy;

  return (
    <div className="container mx-auto py-8">
      <ProductDetails
        product={product}
        isCreator={isCreator}
        userId={session?.user?.id}
      />

      <div className="mt-12">
        <ReviewSection
          productId={product.id}
          userId={session?.user?.id}
          averageRating={Number(product.averageRating) || 0}
          totalRatings={product.totalRatings || 0}
        />
      </div>

      <div className="mt-12">
        <RelatedProducts
          productId={product.id}
          category={product.category}
        />
      </div>
    </div>
  );
} 