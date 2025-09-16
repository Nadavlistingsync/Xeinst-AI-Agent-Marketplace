'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Zap, 
  MessageSquare, 
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const oauthProviders = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email automation and communication',
    icon: Mail,
    color: 'bg-red-100 text-red-600',
    setupUrl: 'https://console.cloud.google.com/',
    docsUrl: 'https://developers.google.com/gmail/api',
    priority: 'HIGH',
    status: 'pending'
  },
  {
    id: 'make',
    name: 'Make.com',
    description: 'Automation and workflow management',
    icon: Zap,
    color: 'bg-blue-100 text-blue-600',
    setupUrl: 'https://www.make.com/en/help/apps/create-app',
    docsUrl: 'https://www.make.com/en/help/apps',
    priority: 'HIGH',
    status: 'pending'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
    setupUrl: 'https://api.slack.com/apps',
    docsUrl: 'https://api.slack.com/authentication/oauth-v2',
    priority: 'MEDIUM',
    status: 'pending'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'App automation and integration',
    icon: Settings,
    color: 'bg-orange-100 text-orange-600',
    setupUrl: 'https://developer.zapier.com/',
    docsUrl: 'https://platform.zapier.com/docs/oauth',
    priority: 'MEDIUM',
    status: 'pending'
  }
];

export default function TestOAuth() {
  const { data: session } = useSession();
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const testOAuth = async (provider: string) => {
    if (!session?.user?.id) {
      alert('Please sign in to test OAuth integrations');
      return;
    }

    setTesting(provider);
    try {
      const response = await fetch(`/api/oauth/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'test-agent',
          redirectUrl: window.location.href
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(prev => ({
          ...prev,
          [provider]: { status: 'success', authUrl: data.authUrl }
        }));
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
      } else {
        const error = await response.json();
        setResults(prev => ({
          ...prev,
          [provider]: { status: 'error', error: error.error }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [provider]: { status: 'error', error: 'Network error' }
      }));
    } finally {
      setTesting(null);
    }
  };

  const getStatusIcon = (provider: string) => {
    const result = results[provider];
    if (!result) return null;
    
    if (result.status === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (result.status === 'error') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return null;
  };

  const getStatusColor = (provider: string) => {
    const result = results[provider];
    if (!result) return 'bg-gray-100 text-gray-800';
    
    if (result.status === 'success') return 'bg-green-100 text-green-800';
    if (result.status === 'error') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OAuth Integration Testing</h1>
          <p className="text-gray-600 mt-2">Test and verify your OAuth integrations</p>
        </div>

        {/* Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Overview of your OAuth integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {oauthProviders.map((provider) => {
                const Icon = provider.icon;
                const result = results[provider.id];
                const isConfigured = result?.status === 'success';
                
                return (
                  <div key={provider.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{provider.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(provider.priority)}>
                          {provider.priority}
                        </Badge>
                        {isConfigured ? (
                          <Badge className="bg-green-100 text-green-800">
                            Configured
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Not Configured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* OAuth Providers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {oauthProviders.map((provider) => {
            const Icon = provider.icon;
            const result = results[provider.id];
            
            return (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(provider.id)}
                      <Badge className={getPriorityColor(provider.priority)}>
                        {provider.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Status */}
                    {result && (
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Status:</span>
                          <Badge className={getStatusColor(provider.id)}>
                            {result.status}
                          </Badge>
                        </div>
                        {result.error && (
                          <p className="text-sm text-red-600 mt-2">
                            Error: {result.error}
                          </p>
                        )}
                        {result.authUrl && (
                          <p className="text-sm text-green-600 mt-2">
                            OAuth URL generated successfully
                          </p>
                        )}
                      </div>
                    )}

                    {/* Setup Instructions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Setup Instructions:</h4>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Go to the {provider.name} developer portal</li>
                        <li>Create a new OAuth application</li>
                        <li>Set redirect URI to: <code className="bg-gray-100 px-1 rounded">https://ai-agency-website-c7fs.vercel.app/api/oauth/{provider.id}/callback</code></li>
                        <li>Copy Client ID and Client Secret to your .env.local</li>
                        <li>Test the integration below</li>
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => testOAuth(provider.id)}
                        disabled={testing === provider.id}
                        className="flex-1"
                      >
                        {testing === provider.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            Test {provider.name}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(provider.setupUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Setup
                      </Button>
                    </div>

                    {/* Documentation Links */}
                    <div className="pt-2 border-t">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(provider.docsUrl, '_blank')}
                        >
                          Documentation
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(provider.setupUrl, '_blank')}
                        >
                          Developer Portal
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Environment Variables Help */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Add these to your .env.local file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div># OAuth Integrations</div>
              <div>GMAIL_CLIENT_ID=your_gmail_client_id</div>
              <div>GMAIL_CLIENT_SECRET=your_gmail_client_secret</div>
              <div>MAKE_CLIENT_ID=your_make_client_id</div>
              <div>MAKE_CLIENT_SECRET=your_make_client_secret</div>
              <div>SLACK_CLIENT_ID=your_slack_client_id</div>
              <div>SLACK_CLIENT_SECRET=your_slack_client_secret</div>
              <div>ZAPIER_CLIENT_ID=your_zapier_client_id</div>
              <div>ZAPIER_CLIENT_SECRET=your_zapier_client_secret</div>
              <div></div>
              <div># Encryption</div>
              <div>ENCRYPTION_KEY=your_32_character_key</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Setup Script */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>
              Run this script to generate your .env.local file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div>./scripts/setup-oauth-complete.sh</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This script will generate a secure encryption key and create a template .env.local file.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}