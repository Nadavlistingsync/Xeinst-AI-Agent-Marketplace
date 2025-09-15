"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Clock,
  User,
  Settings,
  ArrowLeft
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  webhookUrl: string;
  framework: string;
  inputSchema: any;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  platformUserName: string;
  status: string;
  lastUsed?: string;
}

interface ExecutionResult {
  success: boolean;
  result: any;
  requestId: string;
  agent: {
    id: string;
    name: string;
  };
}

export default function UseAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
      fetchConnectedAccounts();
      fetchExecutionHistory();
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
    }
  };

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch(`/api/accounts?agentId=${agentId}`);
      if (response.ok) {
        const accounts = await response.json();
        setConnectedAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    }
  };

  const fetchExecutionHistory = async () => {
    try {
      const response = await fetch(`/api/executions?agentId=${agentId}`);
      if (response.ok) {
        const history = await response.json();
        setExecutionHistory(history);
      }
    } catch (error) {
      console.error('Error fetching execution history:', error);
    }
  };

  const handleExecute = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account to use');
      return;
    }

    if (!input.trim()) {
      toast.error('Please provide input for the agent');
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/run-agent-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          input,
          accountId: selectedAccount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute agent');
      }

      const executionResult = await response.json();
      setResult(executionResult);
      toast.success('Agent executed successfully!');
      
      // Refresh execution history
      fetchExecutionHistory();

    } catch (error) {
      console.error('Execution error:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute agent');
      toast.error('Failed to execute agent');
    } finally {
      setLoading(false);
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading agent...</p>
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
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              <p className="text-muted-foreground">{agent.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Agent Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary">{agent.category}</Badge>
                  <Badge variant="outline">${agent.price} per use</Badge>
                  <Badge variant="outline">{agent.framework}</Badge>
                </div>
                <p className="text-muted-foreground">{agent.description}</p>
              </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Select which account to use for this execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectedAccounts.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No accounts connected. Please go back and connect an account first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {connectedAccounts.map((account) => (
                      <div 
                        key={account.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAccount === account.id 
                            ? 'border-accent bg-accent/10' 
                            : 'border-border hover:border-accent/50'
                        }`}
                        onClick={() => setSelectedAccount(account.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{account.platformUserName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {account.platform} • Last used {account.lastUsed ? new Date(account.lastUsed).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                          {getAccountStatus(account)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>
                  Provide the input data for the agent to process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your input here..."
                  rows={6}
                  className="bg-background/50 border-input/50"
                />
              </CardContent>
            </Card>

            {/* Execute Button */}
            <Button 
              onClick={handleExecute}
              disabled={loading || !selectedAccount || !input.trim()}
              className="w-full bg-gradient-ai hover:bg-gradient-ai/90 text-white py-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Execute Agent
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Result Display */}
            {result && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Execution Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <pre className="text-sm text-white whitespace-pre-wrap">
                        {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Request ID: {result.requestId}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Execution History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executionHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No executions yet</p>
                ) : (
                  <div className="space-y-3">
                    {executionHistory.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={execution.status === 'completed' ? 'secondary' : 'destructive'}>
                            {execution.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(execution.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {execution.input ? JSON.parse(execution.input).input : 'No input'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/agent-setup?agentId=${agentId}`)}
                >
                  Manage Accounts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
