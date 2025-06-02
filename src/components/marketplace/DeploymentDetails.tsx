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
                <span className="ml-1">({deployment.ratingCount} reviews)</span>
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
          {deployment.imageUrl ? (
            <Image
              src={deployment.imageUrl}
              alt={deployment.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600 mb-6">{deployment.description}</p>

          {deployment.longDescription && (
            <>
              <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
              <p className="text-gray-600 mb-6">{deployment.longDescription}</p>
            </>
          )}

          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            {deployment.features?.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            {deployment.requirements?.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>

          {deployment.documentation && (
            <>
              <h2 className="text-xl font-semibold mb-4">Documentation</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                {deployment.documentation}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 