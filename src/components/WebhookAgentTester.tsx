'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, CheckCircle, XCircle, ArrowRight, Settings, Zap, FileText, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface AgentRunResult {
  success: boolean;
  agentId?: string;
  agentName?: string;
  executionTime?: number;
  result?: any;
  webhookStatus?: number;
  error?: string;
}

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  webhookUrl: string;
  exampleInputs: Record<string, any>;
  documentation: string;
}

export function WebhookAgentTester() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [inputs, setInputs] = useState('');
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const predefinedAgents: AgentConfig[] = [
    {
      id: 'agent-1',
      name: 'Lead Scraper',
      description: 'Automatically scrape and collect leads from various sources',
      category: 'Data Collection',
      webhookUrl: 'https://webhook.site/your-unique-id-1',
      exampleInputs: {
        query: 'Miami real estate agents',
        location: 'Miami, FL',
        industry: 'real estate'
      },
      documentation: 'This agent searches for business leads based on your criteria. Provide a search query and location to get started.'
    },
    {
      id: 'agent-2',
      name: 'Sentiment Analyzer',
      description: 'Analyze text sentiment and extract emotional insights',
      category: 'Text Analysis',
      webhookUrl: 'https://webhook.site/your-unique-id-2',
      exampleInputs: {
        text: 'I absolutely love this product! It has exceeded all my expectations.',
        language: 'en'
      },
      documentation: 'Send any text content and get detailed sentiment analysis including confidence scores and key emotional indicators.'
    },
    {
      id: 'agent-3',
      name: 'Data Processor',
      description: 'Process and transform data with custom business logic',
      category: 'Data Processing',
      webhookUrl: 'https://api.example.com/process-data',
      exampleInputs: {
        data: [1, 2, 3, 4, 5],
        operation: 'sum',
        format: 'json'
      },
      documentation: 'Transform your data with various operations like aggregation, filtering, or custom calculations.'
    }
  ];

  const handleAgentSelect = (agent: AgentConfig) => {
    setAgentConfig(agent);
    setInputs(JSON.stringify(agent.exampleInputs, null, 2));
    setCurrentStep(2);
    setError(null);
    setResult(null);
  };

  const handleCustomWebhook = () => {
    if (!customWebhookUrl.trim()) {
      setError('Please enter a valid webhook URL');
      return;
    }
    
    const customAgent: AgentConfig = {
      id: 'custom-agent',
      name: 'Custom Agent',
      description: 'Your custom webhook-based agent',
      category: 'Custom',
      webhookUrl: customWebhookUrl,
      exampleInputs: {},
      documentation: 'Configure your own inputs for this custom agent.'
    };
    
    setAgentConfig(customAgent);
    setInputs('{}');
    setCurrentStep(2);
    setError(null);
    setResult(null);
  };

  const handleConfigureInputs = () => {
    try {
      JSON.parse(inputs);
      setCurrentStep(3);
      setIsConfigured(true);
      setError(null);
    } catch (e) {
      setError('Invalid JSON format. Please check your inputs.');
    }
  };

  const handleRunAgent = async () => {
    if (!agentConfig) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedInputs;
      try {
        parsedInputs = JSON.parse(inputs);
      } catch (e) {
        throw new Error('Invalid JSON in inputs field');
      }

      const response = await fetch('/api/run-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentConfig.id,
          inputs: parsedInputs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run agent');
      }

      setResult(data);
      setCurrentStep(4);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSetup = () => {
    setCurrentStep(1);
    setAgentConfig(null);
    setCustomWebhookUrl('');
    setInputs('');
    setResult(null);
    setError(null);
    setIsConfigured(false);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Agent Setup & Testing
              </CardTitle>
              <CardDescription>
                Configure and test your webhook-based AI agents in 4 simple steps
              </CardDescription>
            </div>
            <Badge variant="outline">Step {currentStep} of 4</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Step 1: Agent Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step 1: Choose Your Agent
            </CardTitle>
            <CardDescription>
              Select a predefined agent or configure your own custom webhook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Predefined Agents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Predefined Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {predefinedAgents.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                    onClick={() => handleAgentSelect(agent)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">{agent.category}</Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Webhook:</strong> {agent.webhookUrl.substring(0, 30)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Custom Webhook */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Custom Webhook</h3>
              <div className="space-y-3">
                <Textarea
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-url.com/endpoint"
                  className="font-mono text-sm"
                  rows={2}
                />
                <Button 
                  onClick={handleCustomWebhook}
                  disabled={!customWebhookUrl.trim()}
                  className="w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Custom Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Input Configuration */}
      {currentStep === 2 && agentConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Step 2: Configure Inputs
            </CardTitle>
            <CardDescription>
              Set up the inputs for {agentConfig.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Agent Info */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{agentConfig.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{agentConfig.documentation}</p>
              <div className="text-xs text-muted-foreground">
                <strong>Webhook URL:</strong> {agentConfig.webhookUrl}
              </div>
            </div>

            {/* Input Configuration */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Input Parameters (JSON)</label>
              <Textarea
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Configure the JSON inputs that will be sent to your agent's webhook
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={handleConfigureInputs} className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue to Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Test Execution */}
      {currentStep === 3 && agentConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Step 3: Test Your Agent
            </CardTitle>
            <CardDescription>
              Run {agentConfig.name} with your configured inputs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Configuration Summary</h3>
              <div className="text-sm space-y-1">
                <div><strong>Agent:</strong> {agentConfig.name}</div>
                <div><strong>Webhook:</strong> {agentConfig.webhookUrl}</div>
                <div><strong>Inputs:</strong></div>
                <pre className="text-xs bg-background p-2 rounded overflow-auto">
                  {inputs}
                </pre>
              </div>
            </div>

            {/* Run Button */}
            <Button 
              onClick={handleRunAgent} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Agent...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Agent Test
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back to Configuration
              </Button>
              <Button variant="outline" onClick={resetSetup}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-4 text-green-600" />
              Step 4: Test Results
            </CardTitle>
            <CardDescription>
              Your agent test has completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Result Summary */}
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-3">
                  <div className="font-medium">
                    {result.success ? '✅ Agent Test Successful' : '❌ Agent Test Failed'}
                  </div>
                  
                  {result.agentName && (
                    <div className="text-sm">
                      <strong>Agent:</strong> {result.agentName} ({result.agentId})
                    </div>
                  )}
                  
                  {result.executionTime && (
                    <div className="text-sm">
                      <strong>Execution Time:</strong> {result.executionTime}ms
                    </div>
                  )}
                  
                  {result.webhookStatus && (
                    <div className="text-sm">
                      <strong>Webhook Status:</strong> {result.webhookStatus}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Detailed Results */}
            {result.result && (
              <div className="space-y-3">
                <h3 className="font-semibold">Response Data</h3>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Run Another Test
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Modify Configuration
              </Button>
              <Button onClick={resetSetup} className="flex-1">
                Setup New Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <Play className="mr-2 h-4 w-4" />
                Run Test Again
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <Settings className="mr-2 h-4 w-4" />
                Modify Configuration
              </Button>
              <Button variant="outline" onClick={resetSetup}>
                <Zap className="mr-2 h-4 w-4" />
                Setup New Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 