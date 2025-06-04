import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardHeaderProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back, {user.name || 'User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Manage your AI agents and monitor their performance
        </p>
      </CardContent>
    </Card>
  );
} 