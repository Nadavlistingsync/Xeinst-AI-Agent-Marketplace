import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../lib/auth";
import { redirect } from 'next/navigation';
import { prisma } from "../../../lib/prisma";
import { PayoutDashboard } from "../../../components/dashboard/PayoutDashboard";

export const metadata: Metadata = {
  title: 'Payouts | Xeinst',
  description: 'Manage your creator payouts and earnings',
};

export default async function PayoutsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect('/login');
  }

  // Get user's payout history
  const payouts = await prisma.payout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // Get user's earnings from credit transactions
  const earnings = await prisma.creditTransaction.findMany({
    where: { 
      userId: user.id,
      type: 'earn'
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // Calculate total earnings
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payouts & Earnings</h1>
          <p className="text-muted-foreground">
            Manage your creator earnings and request payouts
          </p>
        </div>

        <PayoutDashboard 
          user={user}
          payouts={payouts}
          earnings={earnings}
          totalEarnings={totalEarnings}
        />
      </div>
    </div>
  );
}
