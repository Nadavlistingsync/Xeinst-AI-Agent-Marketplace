"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  AlertCircle,
  Zap,
  Globe,
  Settings,
  Key,
  ExternalLink
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";

export default function TestOAuthPage() {
  const [testResults, setTestResults] = useState<any>({});

  const testOAuthEndpoint = async (platform: string) => {
    try {
      const response = await fetch(`/api/oauth/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: 'test-agent',
          platform,
          redirectUrl: window.location.origin + '/test-oauth'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          [platform]: { status: 'success', authUrl: data.authUrl }
        }));
      } else {
        const error = await response.json();
        setTestResults(prev => ({
          ...prev,
          [platform]: { status: 'error', error: error.error }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [platform]: { status: 'error', error: 'Network error' }
      }));
    }
  };

  const platforms = [
    {
      id: 'make',
      name: 'Make.com',
      description: 'Test Make.com OAuth integration',
      icon: Zap,
      color: 'bg-orange-500'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Test Zapier OAuth integration',
      icon: Globe,
      color: 'bg-blue-500'
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Test n8n OAuth integration',
      icon: Settings,
      color: 'bg-purple-500'
    }
  ];

  const getTestStatus = (platform: string) => {
    const result = testResults[platform];
    if (!result) return null;
    
    if (result.status === 'success') {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-400">✅ Working</Badge>;
    } else {
      return <Badge variant="destructive">❌ Error</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-ai rounded-2xl mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">OAuth Integration Test</h1>
          <p className="text-muted-foreground">Test your OAuth integrations before going live</p>
        </motion.div>

        {/* Environment Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables Check</CardTitle>
              <CardDescription>
                Make sure these environment variables are set in your .env.local file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono">MAKE_CLIENT_ID</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">MAKE_CLIENT_SECRET</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">ZAPIER_CLIENT_ID</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">ZAPIER_CLIENT_SECRET</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">ENCRYPTION_KEY</span>
                  <Badge variant="outline">Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* OAuth Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const result = testResults[platform.id];

            return (
              <Card key={platform.id} className="hover:border-accent/50 transition-all">
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
                  <div className="space-y-4">
                    {getTestStatus(platform.id)}
                    
                    {result?.status === 'error' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {result?.status === 'success' && (
                      <Alert className="border-green-500/20 bg-green-500/5">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-xs text-green-300">
                          OAuth endpoint working! Ready to test full flow.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      onClick={() => testOAuthEndpoint(platform.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Test {platform.name}
                    </Button>

                    {result?.authUrl && (
                      <Button 
                        onClick={() => window.open(result.authUrl, '_blank')}
                        className="w-full"
                        variant="default"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test OAuth Flow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-white mb-2">1. Create OAuth Apps</h4>
                  <p className="text-muted-foreground">
                    Go to each platform's developer portal and create OAuth apps with the redirect URI:
                    <code className="bg-muted px-2 py-1 rounded ml-2">
                      https://your-domain.com/api/oauth/[platform]/callback
                    </code>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">2. Add Environment Variables</h4>
                  <p className="text-muted-foreground">
                    Copy the Client ID and Client Secret to your .env.local file
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">3. Test Integration</h4>
                  <p className="text-muted-foreground">
                    Click "Test OAuth Flow" to verify the complete integration works
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">4. Deploy to Production</h4>
                  <p className="text-muted-foreground">
                    Update OAuth apps with your production domain and deploy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
