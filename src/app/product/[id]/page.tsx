import { notFound } from "next/navigation";

async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/list-products`);
  const { products } = await res.json();
  return products.find((p: any) => p.id === id);
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <div className="mb-2 text-gray-600">Category: {product.category}</div>
      <div className="mb-4">{product.description}</div>
      <div className="mb-4 font-bold">${product.price}</div>
      {/* TODO: Add purchase/download logic here */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Buy & Download</button>
    </div>
  );
} 