import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deployment } from '@/types/deployment';
import { formatDistanceToNow } from 'date-fns';

interface AgentCardProps {
  deployment: Deployment;
  onClick?: () => void;
}

export function AgentCard({ deployment, onClick }: AgentCardProps) {
  const {
    name,
    description,
    version,
    status,
    rating,
    downloadCount,
    category,
    accessLevel,
    licenseType,
    createdAt,
  } = deployment;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'deploying':
        return 'bg-yellow-500';
      case 'stopped':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
        {version && (
          <div className="text-sm text-gray-500">
            Version {version}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <Badge variant="outline">
              {category}
            </Badge>
          )}
          {accessLevel && (
            <Badge variant="outline">
              {accessLevel}
            </Badge>
          )}
          {licenseType && (
            <Badge variant="outline">
              {licenseType}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {rating > 0 && (
              <div className="flex items-center">
                <span className="mr-1">★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {downloadCount > 0 && (
              <div>
                {downloadCount} downloads
              </div>
            )}
          </div>
          <div>
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 