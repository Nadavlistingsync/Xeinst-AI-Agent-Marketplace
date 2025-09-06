"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Globe, 
  ExternalLink, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  Settings,
  Maximize,
  Minimize
} from "lucide-react";
import Link from "next/link";

interface WebEmbed {
  id: string;
  name: string;
  description?: string;
  url: string;
  embedUrl: string;
  type: 'website' | 'application' | 'dashboard' | 'tool' | 'custom';
  width: string;
  height: string;
  allowFullscreen: boolean;
  allowScripts: boolean;
  sandbox: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  viewCount: number;
  lastViewed?: string;
  createdAt: string;
  creator: {
    name?: string;
    email: string;
  };
}

export default function WebEmbedViewerPage() {
  const params = useParams();
  const [webEmbed, setWebEmbed] = useState<WebEmbed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchWebEmbed();
  }, [params.id]);

  const fetchWebEmbed = async () => {
    try {
      const response = await fetch(`/api/web-embeds/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWebEmbed(data.webEmbed);
      } else {
        setError("Web embed not found");
      }
    } catch (error) {
      console.error('Error fetching web embed:', error);
      setError("Failed to load web embed");
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ai-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading web embed...</p>
        </div>
      </div>
    );
  }

  if (error || !webEmbed) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container">
          <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Web Embed Not Found</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link href="/web-embeds">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Web Embeds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeColors = {
    website: "bg-blue-500/20 text-blue-500",
    application: "bg-green-500/20 text-green-500",
    dashboard: "bg-purple-500/20 text-purple-500",
    tool: "bg-orange-500/20 text-orange-500",
    custom: "bg-gray-500/20 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <section className="py-8 bg-gradient-dark">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/web-embeds">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">{webEmbed.name}</h1>
                <p className="text-muted-foreground">{webEmbed.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={typeColors[webEmbed.type]}>
                {webEmbed.type}
              </Badge>
              <Button onClick={toggleFullscreen} variant="outline" size="sm">
                {isFullscreen ? (
                  <>
                    <Minimize className="w-4 h-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Web Embed */}
            <div className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
              <Card className="border-ai-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-ai-primary" />
                      <span className="font-medium">Embedded Content</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{webEmbed.viewCount} views</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    <iframe
                      src={webEmbed.embedUrl}
                      width={webEmbed.width}
                      height={webEmbed.height}
                      className="w-full border-0 rounded-b-lg"
                      allowFullScreen={webEmbed.allowFullscreen}
                      sandbox={webEmbed.sandbox}
                      title={webEmbed.name}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            {!isFullscreen && (
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Info Card */}
                  <Card className="border-ai-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">About</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>Created by: {webEmbed.creator.name || webEmbed.creator.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(webEmbed.createdAt).toLocaleDateString()}</span>
                        </div>
                        {webEmbed.lastViewed && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span>Last viewed: {new Date(webEmbed.lastViewed).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings Card */}
                  <Card className="border-ai-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Embed Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Width:</span>
                          <span className="text-white">{webEmbed.width}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Height:</span>
                          <span className="text-white">{webEmbed.height}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fullscreen:</span>
                          <span className={webEmbed.allowFullscreen ? "text-green-500" : "text-red-500"}>
                            {webEmbed.allowFullscreen ? "Allowed" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Scripts:</span>
                          <span className={webEmbed.allowScripts ? "text-green-500" : "text-red-500"}>
                            {webEmbed.allowScripts ? "Allowed" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions Card */}
                  <Card className="border-ai-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full">
                        <a href={webEmbed.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Original
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Embed Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
