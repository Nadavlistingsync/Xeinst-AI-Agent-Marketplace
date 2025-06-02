import Image from "next/image";
import Link from "next/link";
import { Deployment } from "@prisma/client";
import { StarIcon, ShieldCheckIcon, TrendingUpIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

interface AgentCardProps {
  deployment: Deployment;
}

export function AgentCard({ deployment }: AgentCardProps) {
  return (
    <Link href={`/marketplace/${deployment.id}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
            {deployment.imageUrl ? (
              <Image
                src={deployment.imageUrl}
                alt={deployment.name}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              {deployment.isVerified && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Verified
                </Badge>
              )}
              {deployment.isPopular && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  Popular
                </Badge>
              )}
              {deployment.isNew && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  New
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
              {deployment.name}
            </h3>
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">
                {deployment.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {deployment.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{deployment.framework}</Badge>
            <Badge variant="outline">{deployment.category}</Badge>
            <Badge variant="outline">{deployment.accessLevel}</Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(deployment.priceCents)}
          </div>
          <div className="text-sm text-gray-500">
            {deployment.downloadCount} downloads
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 