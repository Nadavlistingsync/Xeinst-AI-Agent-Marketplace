import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, TrendingUp, Sparkles } from "@heroicons/react/20/solid";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import type { MarketplaceDeployment } from "./MarketplaceGrid";

interface AgentCardProps {
  deployment: MarketplaceDeployment;
}

export function AgentCard({ deployment }: AgentCardProps) {
  return (
    <Link href={`/marketplace/${deployment.id}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
              <span className="text-gray-400">No image</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {deployment.status === 'active' && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Active
                </Badge>
              )}
              {deployment.downloadCount > 100 && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </Badge>
              )}
              {new Date(deployment.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 mr-1" />
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
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {deployment.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{deployment.framework}</Badge>
            <Badge variant="outline">{deployment.modelType}</Badge>
            <Badge variant="outline">{deployment.accessLevel}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 