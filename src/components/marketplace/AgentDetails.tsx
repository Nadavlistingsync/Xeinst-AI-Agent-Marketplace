import { Deployment } from '@/types/deployment';
import { Star, ArrowDownTray, Clock } from "@heroicons/react/24/outline";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import { DeploymentActions } from "./DeploymentActions";
// import { DeploymentMetrics } from "./DeploymentMetrics";
// import { DeploymentFeedback } from "./DeploymentFeedback";

interface AgentDetailsProps {
  deployment: Deployment;
}

export default function AgentDetails({ deployment }: AgentDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader className="p-0">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
                <span className="text-gray-400">No image</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{deployment.name}</h1>
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-400" />
                <span className="ml-1 text-lg text-gray-600">
                  {deployment.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline">{deployment.framework}</Badge>
              <Badge variant="outline">{deployment.modelType}</Badge>
              <Badge variant="outline">{deployment.accessLevel}</Badge>
            </div>

            <p className="text-gray-600 mb-6">{deployment.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <ArrowDownTray className="h-4 w-4 mr-1" />
                {deployment.downloadCount} downloads
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Updated {new Date(deployment.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {deployment.totalRatings} ratings
              </div>
              <Button size="lg">Deploy Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        {/* Actions will go here */}
      </div>
    </div>
  );
} 