import Image from 'next/image';
import Link from 'next/link';
import { getRelatedProducts } from '../../lib/product-helpers';
import { formatCurrency } from "../../lib/utils";

interface RelatedProductsProps {
  product_id: string;
}

export async function RelatedProducts({ product_id }: RelatedProductsProps) {
  const relatedProducts = await getRelatedProducts(product_id, '');

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group"
          >
            <div className="relative aspect-square mb-2">
              <Image
                src={product.fileUrl}
                alt={product.name}
                fill
                className="object-cover rounded-lg group-hover:opacity-90 transition-opacity"
              />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-primary font-medium">
              {formatCurrency(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 