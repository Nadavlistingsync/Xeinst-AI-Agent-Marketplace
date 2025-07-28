"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Globe, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Code,
  Bot,
  Loader2,
  Info,
  Play,
  Monitor
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  createdAt: string;
  creator: {
    id: string;
    name?: string;
    email: string;
  };
  agent?: {
    id: string;
    name: string;
    description: string;
  };
}

export default function WebEmbedsPage() {
  const { data: session } = useSession();
  const [webEmbeds, setWebEmbeds] = useState<WebEmbed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmbed, setSelectedEmbed] = useState<WebEmbed | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    embedUrl: '',
    type: 'website' as const,
    width: '100%',
    height: '600px',
    allowFullscreen: true,
    allowScripts: false,
    sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups',
    allowedDomains: [] as string[],
    blockedDomains: [] as string[],
    requireAuth: false,
  });

  useEffect(() => {
    fetchWebEmbeds();
  }, []);

  const fetchWebEmbeds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/web-embeds');
      if (!response.ok) throw new Error('Failed to fetch web embeds');
      const data = await response.json();
      setWebEmbeds(data.webEmbeds || []);
    } catch (error) {
      console.error('Error fetching web embeds:', error);
      toast.error('Failed to fetch web embeds');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmbed = async () => {
    if (!session?.user) {
      toast.error('Please sign in to create web embeds');
      return;
    }

    if (!formData.name || !formData.url || !formData.embedUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/web-embeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create web embed');
      
      toast.success('Web embed created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        url: '',
        embedUrl: '',
        type: 'website',
        width: '100%',
        height: '600px',
        allowFullscreen: true,
        allowScripts: false,
        sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups',
        allowedDomains: [],
        blockedDomains: [],
        requireAuth: false,
      });
      fetchWebEmbeds();
    } catch (error) {
      console.error('Error creating web embed:', error);
      toast.error('Failed to create web embed');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEmbed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this web embed?')) return;

    try {
      const response = await fetch(`/api/web-embeds/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete web embed');
      
      toast.success('Web embed deleted successfully!');
      fetchWebEmbeds();
    } catch (error) {
      console.error('Error deleting web embed:', error);
      toast.error('Failed to delete web embed');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website': return Globe;
      case 'application': return Code;
      case 'dashboard': return Monitor;
      case 'tool': return Settings;
      case 'custom': return Bot;
      default: return Globe;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-ai-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Web Embeds
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Embed existing websites and add AI functionality without creating full agents. 
            Perfect for integrating AI features into any website without code changes.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-ai-primary/20 bg-ai-primary/5">
          <Info className="h-4 w-4 text-ai-primary" />
          <AlertDescription className="text-muted-foreground">
            <strong>Alternative to Agent Upload:</strong> Instead of creating and uploading full AI agents, 
            you can embed any existing website and add AI functionality to it. This is faster and easier 
            when you want to enhance existing sites with AI features.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-ai hover:bg-gradient-ai/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create New Embed'}
          </Button>
          
          {webEmbeds.length > 0 && (
            <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
              <Play className="w-4 h-4 mr-2" />
              View All Embeds
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-8 border-ai-primary/20">
            <CardHeader>
              <CardTitle className="text-white">Create New Web Embed</CardTitle>
              <CardDescription className="text-muted-foreground">
                Embed an existing website and optionally connect an AI agent to add functionality. 
                This is an alternative to uploading full agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Website Embed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this embed does and what AI functionality you want to add..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Original URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">The original website URL you want to embed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="embedUrl">Embed URL *</Label>
                  <Input
                    id="embedUrl"
                    placeholder="https://example.com"
                    value={formData.embedUrl}
                    onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">The URL to embed (iframe src) - can be the same as original URL</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    placeholder="100%"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    placeholder="600px"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Fullscreen</Label>
                    <p className="text-xs text-muted-foreground">Let users go fullscreen</p>
                  </div>
                  <Switch
                    checked={formData.allowFullscreen}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowFullscreen: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Scripts</Label>
                    <p className="text-xs text-muted-foreground">Allow JavaScript execution (use with caution)</p>
                  </div>
                  <Switch
                    checked={formData.allowScripts}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowScripts: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCreateEmbed}
                  disabled={isCreating}
                  className="bg-gradient-ai hover:bg-gradient-ai/90"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Create Embed
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Web Embeds List */}
        {webEmbeds.length === 0 ? (
          <Card className="text-center py-12 border-ai-primary/20">
            <CardContent>
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Web Embeds Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first web embed to start integrating AI functionality into existing websites. 
                This is faster than creating full agents when you want to enhance existing sites.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-ai hover:bg-gradient-ai/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Embed
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webEmbeds.map((embed) => {
              const TypeIcon = getTypeIcon(embed.type);
              return (
                <Card key={embed.id} className="hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <Badge className={`${getStatusColor(embed.status)} text-white`}>
                        {embed.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{embed.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {embed.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{embed.url}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{embed.viewCount} views</span>
                      </div>

                      {embed.agent && (
                        <div className="flex items-center space-x-2 text-sm text-ai-primary">
                          <Bot className="w-4 h-4" />
                          <span>AI Agent Connected</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90"
                          onClick={() => setSelectedEmbed(embed)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEmbed(embed.id)}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Selected Embed Viewer */}
        {selectedEmbed && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedEmbed.name}</h3>
                  <p className="text-muted-foreground">{selectedEmbed.description}</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedEmbed(null)}
                  className="text-muted-foreground hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="flex-1 p-6">
                <iframe
                  src={selectedEmbed.embedUrl}
                  width={selectedEmbed.width}
                  height={selectedEmbed.height}
                  className="w-full h-full border border-border rounded-lg"
                  allowFullScreen={selectedEmbed.allowFullscreen}
                  sandbox={selectedEmbed.sandbox}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 