import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeFeedback } from '@/lib/feedback-monitoring';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await analyzeFeedback(params.id);
    const categories = Object.entries(metrics.categories).map(([name, value]) => ({
      name,
      value,
    }));

    // Sort categories by value in descending order
    categories.sort((a, b) => b.value - a.value);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching feedback categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 