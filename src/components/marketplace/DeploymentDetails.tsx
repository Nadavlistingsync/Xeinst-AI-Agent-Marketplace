import Image from "next/image";
import { Deployment } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarIcon } from "@heroicons/react/20/solid";
import { formatDistanceToNow } from "date-fns";

interface DeploymentDetailsProps {
  deployment: Deployment & {
    deployer: {
      name: string | null;
      image: string | null;
    };
  };
}

export function DeploymentDetails({ deployment }: DeploymentDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deployment.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="ml-1">{deployment.rating.toFixed(1)}</span>
              </div>
              <span>{deployment.downloadCount} downloads</span>
              <span>Updated {formatDistanceToNow(deployment.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{deployment.framework}</Badge>
            <Badge variant="outline">{deployment.accessLevel}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600 mb-6">{deployment.description}</p>

          {/* Documentation removed as it does not exist in the Deployment model */}
        </div>
      </CardContent>
    </Card>
  );
} 