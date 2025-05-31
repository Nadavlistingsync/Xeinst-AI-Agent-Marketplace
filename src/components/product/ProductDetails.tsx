import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: {
      name: string;
    };
    seller: {
      name: string;
    };
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative aspect-square">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-semibold text-primary">
          {formatCurrency(product.price)}
        </p>
        <p className="text-gray-600">{product.description}</p>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Category:</span> {product.category.name}
          </p>
          <p>
            <span className="font-semibold">Seller:</span> {product.seller.name}
          </p>
        </div>
        <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
} 