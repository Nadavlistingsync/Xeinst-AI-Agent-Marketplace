import Image from "next/image";
import { Deployment } from "@prisma/client";
import { StarIcon, ShieldCheckIcon, TrendingUpIcon, SparklesIcon, DownloadIcon, ClockIcon } from "@heroicons/react/20/solid";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DeploymentActions } from "./DeploymentActions";
import { DeploymentMetrics } from "./DeploymentMetrics";
import { DeploymentFeedback } from "./DeploymentFeedback";

interface AgentDetailsProps {
  deployment: Deployment;
}

export function AgentDetails({ deployment }: AgentDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
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
              <div className="absolute top-4 right-4 flex gap-2">
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

          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{deployment.name}</h1>
              <div className="flex items-center">
                <StarIcon className="h-6 w-6 text-yellow-400" />
                <span className="ml-1 text-lg text-gray-600">
                  {deployment.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline">{deployment.framework}</Badge>
              <Badge variant="outline">{deployment.category}</Badge>
              <Badge variant="outline">{deployment.accessLevel}</Badge>
              <Badge variant="outline">v{deployment.version}</Badge>
            </div>

            <p className="text-gray-600 mb-6">{deployment.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <DownloadIcon className="h-4 w-4 mr-1" />
                {deployment.downloadCount} downloads
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Updated {new Date(deployment.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(deployment.priceCents)}
              </div>
              <Button size="lg">Deploy Now</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="features">
          <TabsList>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {deployment.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {deployment.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <DeploymentMetrics deploymentId={deployment.id} />
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <DeploymentFeedback deploymentId={deployment.id} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-1">
        <DeploymentActions deployment={deployment} />
      </div>
    </div>
  );
} 