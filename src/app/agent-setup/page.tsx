'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Zap,
  Settings,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  webhookUrl: string;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  platformUserName: string;
  status: string;
  agentId: string;
}

const platforms = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails',
    icon: Mail,
    color: 'bg-red-100 text-red-600',
    required: ['email_responder', 'email_automation', 'communication']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-600',
    required: ['communication', 'notifications', 'team_automation']
  },
  {
    id: 'make',
    name: 'Make.com',
    description: 'Automation and workflow management',
    icon: Zap,
    color: 'bg-blue-100 text-blue-600',
    required: ['automation', 'workflow', 'integration']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect apps and automate tasks',
    icon: Settings,
    color: 'bg-orange-100 text-orange-600',
    required: ['automation', 'integration', 'workflow']
  }
];

export default function AgentSetup() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const fetchData = useCallback(async () => {
    try {
      const agentId = searchParams.get('agentId') || searchParams.get('id');
      if (agentId) {
        const agentRes = await fetch(`/api/agents/${agentId}`);
        if (agentRes.ok) {
          const agentData = await agentRes.json();
          setAgent(agentData.agent);
        }
      }

      const accountsRes = await fetch('/api/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setConnectedAccounts(accountsData.accounts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session, fetchData]);

  const connectAccount = async (platform: string) => {
    if (!agent) return;

    setConnecting(platform);
    try {
      const response = await fetch(`/api/oauth/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          redirectUrl: window.location.href
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        console.error('Failed to start OAuth flow');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
    } finally {
      setConnecting(null);
    }
  };

  const isAccountConnected = (platform: string) => {
    return connectedAccounts.some(account => 
      account.platform === platform && 
      account.agentId === agent?.id && 
      account.status === 'connected'
    );
  };

  const isPlatformRequired = (platform: string) => {
    if (!agent) return false;
    const platformData = platforms.find(p => p.id === platform);
    return platformData?.required.some(req => 
      agent.category.toLowerCase().includes(req) ||
      agent.description.toLowerCase().includes(req)
    ) || false;
  };

  const getRequiredPlatforms = () => {
    if (!agent) return [];
    return platforms.filter(platform => isPlatformRequired(platform.id));
  };

  const allRequiredConnected = () => {
    const required = getRequiredPlatforms();
    return required.every(platform => isAccountConnected(platform.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">The agent you're looking for doesn't exist.</p>
          <Link href="/marketplace">
            <Button>Browse Agents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">
              {success === 'gmail_connected' && 'Gmail account connected successfully!'}
              {success === 'slack_connected' && 'Slack account connected successfully!'}
              {success === 'make_connected' && 'Make.com account connected successfully!'}
              {success === 'zapier_connected' && 'Zapier account connected successfully!'}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">
              {error === 'oauth_failed' && 'Failed to connect account. Please try again.'}
              {error === 'missing_parameters' && 'Missing required parameters. Please try again.'}
              {error && !['oauth_failed', 'missing_parameters'].includes(error) && `Error: ${error}`}
            </span>
          </div>
        )}

        {/* Agent Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{agent.name}</CardTitle>
                <CardDescription className="mt-2">{agent.description}</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {agent.price} credits
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-6">
          {/* Step 1: Connect Required Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                Connect Required Accounts
              </CardTitle>
              <CardDescription>
                Connect the accounts this agent needs to function properly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRequiredPlatforms().map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = isAccountConnected(platform.id);
                  
                  return (
                    <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-gray-500">{platform.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => connectAccount(platform.id)}
                            disabled={connecting === platform.id}
                            size="sm"
                          >
                            {connecting === platform.id ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Optional Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                Optional Connections
              </CardTitle>
              <CardDescription>
                Connect additional accounts for enhanced functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platforms.filter(platform => !isPlatformRequired(platform.id)).map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = isAccountConnected(platform.id);
                  
                  return (
                    <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-gray-500">{platform.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => connectAccount(platform.id)}
                            disabled={connecting === platform.id}
                            size="sm"
                            variant="outline"
                          >
                            {connecting === platform.id ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Ready to Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                Ready to Use
              </CardTitle>
              <CardDescription>
                Your agent is ready to use with your connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                {allRequiredConnected() ? (
                  <div>
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Setup Complete!</h3>
                    <p className="text-gray-500 mb-6">Your agent is ready to use with your connected accounts.</p>
                    <div className="space-x-4">
                      <Link href={`/use-agent/${agent.id}`}>
                        <Button size="lg">
                          Use Agent
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="outline" size="lg">Go to Dashboard</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <LinkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Required Accounts</h3>
                    <p className="text-gray-500 mb-6">Please connect all required accounts to use this agent.</p>
                    <Button variant="outline" size="lg" disabled>
                      Connect Required Accounts First
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}