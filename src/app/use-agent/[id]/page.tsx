'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  webhookUrl: string;
  config: any;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  platformUserName: string;
  status: string;
}

interface ExecutionResult {
  executionId: string;
  status: string;
  output: any;
  error?: string;
  executionTime: number;
  creditsUsed: number;
  remainingCredits: number;
}

export default function UseAgent() {
  const { data: session } = useSession();
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [input, setInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id && agentId) {
      fetchData();
    }
  }, [session, agentId]);

  const fetchData = async () => {
    try {
      const [agentRes, accountsRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch('/api/accounts')
      ]);

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgent(agentData.agent);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setConnectedAccounts(accountsData.accounts.filter((acc: ConnectedAccount) => acc.agentId === agentId));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeAgent = async () => {
    if (!agent || !input.trim()) return;

    setExecuting(true);
    setResult(null);

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          input: JSON.parse(input),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setResult({
          executionId: '',
          status: 'failed',
          output: null,
          error: errorData.error || 'Execution failed',
          executionTime: 0,
          creditsUsed: 0,
          remainingCredits: 0
        });
      }
    } catch (error) {
      setResult({
        executionId: '',
        status: 'failed',
        output: null,
        error: 'Network error occurred',
        executionTime: 0,
        creditsUsed: 0,
        remainingCredits: 0
      });
    } finally {
      setExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-gray-600 mt-2">{agent.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Agent Input
                </CardTitle>
                <CardDescription>
                  Provide the input data for the agent to process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your input as JSON format..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Enter valid JSON input for the agent
                    </p>
                    <Button
                      onClick={executeAgent}
                      disabled={executing || !input.trim()}
                      className="flex items-center"
                    >
                      {executing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Execute Agent
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Result Section */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-2">Execution Result</span>
                  </CardTitle>
                  <CardDescription>
                    Execution ID: {result.executionId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {result.executionTime}ms
                      </div>
                    </div>

                    {result.error ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Error</h4>
                        <p className="text-red-700">{result.error}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Output</h4>
                        <pre className="text-green-700 text-sm overflow-auto">
                          {JSON.stringify(result.output, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Credits used: {result.creditsUsed}
                      </span>
                      <span className="text-gray-600">
                        Remaining: {result.remainingCredits}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Category</h4>
                  <p className="text-sm text-gray-600 capitalize">{agent.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Price per execution</h4>
                  <p className="text-sm text-gray-600">{agent.price} credits</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Accounts connected to this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectedAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-4">No accounts connected</p>
                    <Link href={`/agent-setup?agentId=${agent.id}`}>
                      <Button size="sm">Connect Accounts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectedAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize text-sm">{account.platform}</p>
                          <p className="text-xs text-gray-500">{account.platformUserName}</p>
                        </div>
                        <Badge className={getStatusColor(account.status)}>
                          {account.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credits Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost per execution:</span>
                    <span className="text-sm font-medium">{agent.price} credits</span>
                  </div>
                  {result && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last execution:</span>
                        <span className="text-sm font-medium">{result.creditsUsed} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Remaining:</span>
                        <span className="text-sm font-medium">{result.remainingCredits} credits</span>
                      </div>
                    </>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}