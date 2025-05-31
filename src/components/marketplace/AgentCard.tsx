import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Agent {
  id: string;
  name: string;
  description: string;
  framework: string;
  access_level: string;
  licenseType: string;
  priceCents: number;
  rating: number;
  ratingCount: number;
  download_count: number;
  created_at: Date;
  deployer: {
    name: string | null;
    image: string | null;
  };
}

interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{agent.name}</CardTitle>
            <CardDescription className="mt-1">
              by {agent.deployer.name || "Anonymous"}
            </CardDescription>
          </div>
          <Badge variant={agent.access_level === "public" ? "default" : "secondary"}>
            {agent.access_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 line-clamp-3">{agent.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1">{agent.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500">({agent.ratingCount} reviews)</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {agent.download_count} downloads
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Created {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          {agent.priceCents > 0 ? `$${(agent.priceCents / 100).toFixed(2)}` : "Free"}
        </div>
        <Button onClick={() => onSelect?.(agent)}>View Details</Button>
      </CardFooter>
    </Card>
  );
} 