"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  ExternalLink, 
  Bot, 
  Eye, 
  Settings,
  Loader2
} from 'lucide-react';

interface WebEmbed {
  id: string;
  name: string;
  description?: string;
  url: string;
  embedUrl: string;
  type: 'website' | 'application' | 'dashboard' | 'tool' | 'custom';
  status: 'active' | 'inactive' | 'pending' | 'error';
  width: string;
  height: string;
  allowFullscreen: boolean;
  allowScripts: boolean;
  sandbox: string;
  viewCount: number;
  lastViewed?: string;
  agent?: {
    id: string;
    name: string;
    description: string;
    webhookUrl?: string;
  };
}

interface WebEmbedViewerProps {
  embedId: string;
  showControls?: boolean;
  className?: string;
}

export function WebEmbedViewer({ embedId, showControls = true, className = '' }: WebEmbedViewerProps) {
  const [embed, setEmbed] = useState<WebEmbed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchEmbed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/web-embeds/${embedId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch web embed');
      }
      
      const data = await response.json();
      setEmbed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load embed');
    } finally {
      setIsLoading(false);
    }
  }, [embedId]);

  useEffect(() => {
    fetchEmbed();
  }, [fetchEmbed]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website': return <Globe className="w-4 h-4" />;
      case 'application': return <Settings className="w-4 h-4" />;
      case 'dashboard': return <Settings className="w-4 h-4" />;
      case 'tool': return <Settings className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !embed) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <Alert>
            <AlertDescription>
              {error || 'Web embed not found'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (embed.status !== 'active') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getTypeIcon(embed.type)}
            <div>
              <CardTitle>{embed.name}</CardTitle>
              <CardDescription>{embed.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(embed.status)}>
              {embed.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This web embed is currently {embed.status}. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getTypeIcon(embed.type)}
            <div>
              <CardTitle>{embed.name}</CardTitle>
              <CardDescription>{embed.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(embed.status)}>
              {embed.status}
            </Badge>
            {embed.agent && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Agent Ready
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{embed.viewCount} views</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(embed.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Original
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        )}

        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(false)}
              >
                Exit Fullscreen
              </Button>
            </div>
          )}
          <iframe
            src={embed.embedUrl}
            width={isFullscreen ? '100vw' : embed.width}
            height={isFullscreen ? '100vh' : embed.height}
            allowFullScreen={embed.allowFullscreen}
            sandbox={embed.sandbox}
            className={`border-0 rounded ${isFullscreen ? 'w-full h-full' : 'w-full'}`}
            title={embed.name}
            loading="lazy"
          />
        </div>

        {embed.agent && (
          <Alert>
            <Bot className="w-4 h-4" />
            <AlertDescription>
              This embed has an AI agent integrated. You can interact with the agent through the embedded application.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 