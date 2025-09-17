import { getProduct } from '../../../lib/product-helpers';
import { notFound } from "next/navigation";
import { ProductDetails } from "../../../components/product/ProductDetails";
import { ReviewSection } from "../../../components/product/ReviewSection";
import { RelatedProducts } from "../../../components/product/RelatedProducts";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const productWithDetails = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price) || 0,
    images: [product.fileUrl || ''],
    category: {
      name: product.category
    },
    seller: {
      name: product.createdBy
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails
        product={productWithDetails}
      />
      <div className="mt-12">
        <ReviewSection
          product_id={product.id}
        />
      </div>
      <div className="mt-12">
        <RelatedProducts
          product_id={product.id}
        />
      </div>
    </div>
  );
} 