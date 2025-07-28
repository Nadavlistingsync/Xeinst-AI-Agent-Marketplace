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
import { 
  Plus, 
  Globe, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  Code,
  Bot,
  Loader2
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

    setIsCreating(true);
    try {
      const response = await fetch('/api/web-embeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create web embed');
      }

      const newEmbed = await response.json();
      setWebEmbeds([newEmbed, ...webEmbeds]);
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
      toast.success('Web embed created successfully!');
    } catch (error) {
      console.error('Error creating web embed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create web embed');
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete web embed');
      }

      setWebEmbeds(webEmbeds.filter(embed => embed.id !== id));
      toast.success('Web embed deleted successfully!');
    } catch (error) {
      console.error('Error deleting web embed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete web embed');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website': return <Globe className="w-4 h-4" />;
      case 'application': return <Code className="w-4 h-4" />;
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
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Web Embeds</h1>
          <p className="text-muted-foreground mt-2">
            Embed websites and applications on your platform
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Embed
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Web Embed</CardTitle>
            <CardDescription>
              Embed any website or application on your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Website Embed"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your web embed..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="embedUrl">Embed URL</Label>
                <Input
                  id="embedUrl"
                  type="url"
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  placeholder="https://example.com/embed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  placeholder="100%"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="600px"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowFullscreen"
                  checked={formData.allowFullscreen}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowFullscreen: checked })}
                />
                <Label htmlFor="allowFullscreen">Allow Fullscreen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowScripts"
                  checked={formData.allowScripts}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowScripts: checked })}
                />
                <Label htmlFor="allowScripts">Allow Scripts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireAuth"
                  checked={formData.requireAuth}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireAuth: checked })}
                />
                <Label htmlFor="requireAuth">Require Authentication</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateEmbed} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Embed'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webEmbeds.map((embed) => (
          <Card key={embed.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getTypeIcon(embed.type)}
                  <div>
                    <CardTitle className="text-lg">{embed.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {embed.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(embed.status)}>
                  {embed.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{embed.url}</span>
                </div>
                {embed.agent && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Bot className="w-4 h-4" />
                    <span>Agent: {embed.agent.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{embed.viewCount} views</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedEmbed(embed)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(embed.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {session?.user?.id === embed.creator.id && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* TODO: Edit functionality */}}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEmbed(embed.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {webEmbeds.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No web embeds yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first web embed to get started
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Embed
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedEmbed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedEmbed.name}</h2>
              <Button variant="outline" onClick={() => setSelectedEmbed(null)}>
                Close
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={selectedEmbed.embedUrl}
                width={selectedEmbed.width}
                height={selectedEmbed.height}
                allowFullScreen={selectedEmbed.allowFullscreen}
                sandbox={selectedEmbed.sandbox}
                className="w-full h-full border-0 rounded"
                title={selectedEmbed.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 