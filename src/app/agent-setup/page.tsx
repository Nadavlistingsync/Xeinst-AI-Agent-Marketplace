"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Zap,
  Globe,
  Settings,
  Key,
  Shield,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import AccountConnection from "../../components/AccountConnection";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  webhookUrl: string;
  framework: string;
}

export default function AgentSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);

  const agentId = searchParams.get('agentId');
  const success = searchParams.get('success');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (success) {
      toast.success('Account connected successfully!');
    }
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [success, errorParam]);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
      fetchConnectedAccounts();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      const agentData = await response.json();
      setAgent(agentData);
    } catch (error) {
      console.error('Error fetching agent:', error);
      setError('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch(`/api/accounts?agentId=${agentId}`);
      if (response.ok) {
        const accounts = await response.json();
        setConnectedAccounts(accounts);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    }
  };

  const handleAccountConnected = (account: any) => {
    setConnectedAccounts(prev => [...prev, account]);
    toast.success(`${account.platform} account connected successfully!`);
  };

  const handleStartUsingAgent = () => {
    if (connectedAccounts.length === 0) {
      toast.error('Please connect at least one account before using the agent');
      return;
    }
    
    // Redirect to agent usage page
    router.push(`/use-agent/${agentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading agent setup...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Agent not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Setup Complete!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your agent is ready to use with your connected accounts
            </p>
          </motion.div>

          <div className="text-center space-y-4">
            <Button 
              size="lg" 
              className="bg-gradient-ai hover:bg-gradient-ai/90 text-white px-8 py-4 text-lg"
              onClick={handleStartUsingAgent}
            >
              Start Using Agent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Agent Setup</h1>
          <p className="text-muted-foreground">Connect your accounts to use this agent</p>
        </motion.div>

        {/* Agent Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {agent.name}
              </CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{agent.category}</Badge>
                <Badge variant="outline">${agent.price} per use</Badge>
                <Badge variant="outline">{agent.framework}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AccountConnection 
            agentId={agentId!}
            onAccountConnected={handleAccountConnected}
          />
        </motion.div>

        {/* Continue Button */}
        {connectedAccounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Button 
              size="lg" 
              className="bg-gradient-ai hover:bg-gradient-ai/90 text-white px-8 py-4 text-lg"
              onClick={handleStartUsingAgent}
            >
              Continue to Agent Usage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
