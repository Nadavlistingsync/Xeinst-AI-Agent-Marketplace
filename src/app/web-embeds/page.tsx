"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Globe, Search, Plus, ExternalLink, Eye } from "lucide-react";
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

export default function WebEmbedsPage() {
  const [webEmbeds, setWebEmbeds] = useState<WebEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchWebEmbeds();
  }, []);

  const fetchWebEmbeds = async () => {
    try {
      const response = await fetch('/api/web-embeds');
      if (response.ok) {
        const data = await response.json();
        setWebEmbeds(data.webEmbeds || []);
      }
    } catch (error) {
      console.error('Error fetching web embeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWebEmbeds = webEmbeds.filter(embed => {
    const matchesSearch = embed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (embed.description && embed.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || embed.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeColors = {
    website: "bg-blue-500/20 text-blue-500",
    application: "bg-green-500/20 text-green-500",
    dashboard: "bg-purple-500/20 text-purple-500",
    tool: "bg-orange-500/20 text-orange-500",
    custom: "bg-gray-500/20 text-gray-500",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ai-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading web embeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-dark">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 mb-6">
              <Badge className="bg-ai-primary/20 text-ai-primary border-ai-primary/30 px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Web Embeds
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-animate">Web Embeds</span>
              <br />
              <span className="text-white">Collection</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse and use embedded tools and applications from our community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="btn-primary text-lg px-8 py-4">
                <Link href="/upload" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Web Embed
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search web embeds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-white"
                >
                  <option value="all">All Types</option>
                  <option value="website">Website</option>
                  <option value="application">Application</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="tool">Tool</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Web Embeds Grid */}
          {filteredWebEmbeds.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No web embeds found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedType !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a web embed!"
                }
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Web Embed
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebEmbeds.map((embed, index) => (
                <motion.div
                  key={embed.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white mb-2">{embed.name}</CardTitle>
                          <Badge className={`${typeColors[embed.type]} mb-2`}>
                            {embed.type}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {embed.viewCount}
                          </div>
                        </div>
                      </div>
                      {embed.description && (
                        <CardDescription className="text-muted-foreground">
                          {embed.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>Created by: {embed.creator.name || embed.creator.email}</p>
                        <p>Created: {new Date(embed.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/web-embeds/${embed.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a href={embed.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 