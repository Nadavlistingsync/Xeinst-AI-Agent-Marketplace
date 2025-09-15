"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Globe,
  Settings,
  Shield,
  Key
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

interface ConnectedAccount {
  id: string;
  platform: string;
  name: string;
  status: 'connected' | 'error' | 'expired';
  lastUsed?: Date;
  permissions: string[];
}

interface AccountConnectionProps {
  agentId: string;
  onAccountConnected: (account: ConnectedAccount) => void;
}

const supportedPlatforms = [
  {
    id: 'make',
    name: 'Make.com',
    description: 'Connect your Make.com account to run scenarios',
    icon: Zap,
    color: 'bg-orange-500',
    oauthUrl: '/api/oauth/make',
    permissions: ['scenarios:read', 'scenarios:execute', 'webhooks:manage']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect your Zapier account to trigger workflows',
    icon: Globe,
    color: 'bg-blue-500',
    oauthUrl: '/api/oauth/zapier',
    permissions: ['zaps:read', 'zaps:execute', 'webhooks:manage']
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Connect your n8n instance to run workflows',
    icon: Settings,
    color: 'bg-purple-500',
    oauthUrl: '/api/oauth/n8n',
    permissions: ['workflows:read', 'workflows:execute', 'webhooks:manage']
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Add your API keys and credentials',
    icon: Key,
    color: 'bg-gray-500',
    oauthUrl: '/api/oauth/custom',
    permissions: ['api:access']
  }
];

export default function AccountConnection({ agentId, onAccountConnected }: AccountConnectionProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    setError("");

    try {
      const platform = supportedPlatforms.find(p => p.id === platformId);
      if (!platform) throw new Error('Platform not found');

      // Start OAuth flow
      const response = await fetch(platform.oauthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId,
          platform: platformId,
          redirectUrl: window.location.origin + '/agent-setup'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start OAuth flow');
      }

      const { authUrl } = await response.json();
      
      // Redirect to OAuth provider
      window.location.href = authUrl;

    } catch (error) {
      console.error('Connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect account');
      toast.error('Failed to connect account');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch('/api/accounts/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast.success('Account disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const getAccountStatus = (account: ConnectedAccount) => {
    switch (account.status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Connect Your Accounts</h3>
        <p className="text-muted-foreground">
          Connect your accounts to use this agent with your data and services
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Connected Accounts
            </CardTitle>
            <CardDescription>
              These accounts are connected and ready to use with this agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{account.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {account.platform} • Last used {account.lastUsed?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getAccountStatus(account)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportedPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectedAccounts.some(acc => acc.platform === platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <motion.div
              key={platform.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`cursor-pointer transition-all duration-200 ${
                isConnected 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'hover:border-accent/50 hover:bg-accent/5'
              }`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{platform.name}</CardTitle>
                      <CardDescription>{platform.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {platform.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={isConnected ? "outline" : "default"}
                      disabled={isConnecting || isConnected}
                      onClick={() => handleConnect(platform.id)}
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </>
                      ) : isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect {platform.name}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Security Notice */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-300 space-y-2">
            <p>• Your credentials are encrypted and stored securely</p>
            <p>• We only access the permissions you explicitly grant</p>
            <p>• You can disconnect accounts at any time</p>
            <p>• Your data is never shared with third parties</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
