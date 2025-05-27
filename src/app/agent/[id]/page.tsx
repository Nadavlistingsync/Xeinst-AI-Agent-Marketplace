import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProduct } from '@/lib/db-helpers';
import { AgentPageClient } from './AgentPageClient';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AgentPage({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const product = await getProduct(resolvedParams.id);
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