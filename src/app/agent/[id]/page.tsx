import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProduct } from '@/lib/db-helpers';
import { AgentPageClient } from './AgentPageClient';

export default async function AgentPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const session = await getServerSession(authOptions);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Agent not found</h1>
      </div>
    );
  }

  const isCreator = session?.user?.id === product.created_by;

  return <AgentPageClient product={product} isCreator={isCreator} />;
} 