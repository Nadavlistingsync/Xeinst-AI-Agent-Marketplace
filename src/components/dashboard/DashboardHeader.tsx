import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface DashboardHeaderProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back, {user.name || 'User'}!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 