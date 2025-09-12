'use client';

import React, { useState } from 'react';
import { Button } from ".//ui/button";
import { Input } from ".//ui/input";
import { Textarea } from ".//ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from ".//ui/card";
import { Label } from ".//ui/label";
import { Switch } from ".//ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from ".//ui/tabs";
import { Alert, AlertDescription } from ".//ui/alert";
import { Loader2, Globe, Zap, Shield, Settings, Download, ExternalLink } from 'lucide-react';

interface APICall {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  description: string;
}

interface InternetExecutorConfig {
  name: string;
  description: string;
  webhookUrl: string;
  task: string;
  apiCalls: APICall[];
  credentials: Record<string, string>;
  rateLimit: {
    requestsPerMinute: number;
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  timeout: number;
  parallelExecution: boolean;
}

export default function InternetExecutorAgent() {
  const [config, setConfig] = useState<InternetExecutorConfig>({
    name: '',
    description: '',
    webhookUrl: '',
    task: '',
    apiCalls: [],
    credentials: {},
    rateLimit: { requestsPerMinute: 60 },
    retryConfig: { maxRetries: 3, backoffMs: 1000 },
    timeout: 30000,
    parallelExecution: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const addAPICall = () => {
    setConfig(prev => ({
      ...prev,
      apiCalls: [...prev.apiCalls, {
        url: '',
        method: 'GET',
        headers: {},
        body: null,
        description: '',
      }]
    }));
  };

  const updateAPICall = (index: number, field: keyof APICall, value: any) => {
    setConfig(prev => ({
      ...prev,
      apiCalls: prev.apiCalls.map((call, i) => 
        i === index ? { ...call, [field]: value } : call
      )
    }));
  };

  const removeAPICall = (index: number) => {
    setConfig(prev => ({
      ...prev,
      apiCalls: prev.apiCalls.filter((_, i) => i !== index)
    }));
  };

  const addCredential = () => {
    const key = prompt('Enter credential key (e.g., API_KEY):');
    const value = prompt('Enter credential value:');
    if (key && value) {
      setConfig(prev => ({
        ...prev,
        credentials: { ...prev.credentials, [key]: value }
      }));
    }
  };

  const removeCredential = (key: string) => {
    setConfig(prev => {
      const newCredentials = { ...prev.credentials };
      delete newCredentials[key];
      return { ...prev, credentials: newCredentials };
    });
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'internet-executor',
          webhookUrl: config.webhookUrl,
          inputs: {
            task: config.task,
            api_calls: config.apiCalls,
            external_apis: config.apiCalls.map(call => call.url),
            web_requests: config.apiCalls,
            credentials: config.credentials,
            rate_limit: config.rateLimit,
            retry_config: config.retryConfig,
            timeout: config.timeout,
            parallel_execution: config.parallelExecution,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Agent failed: ${response.status}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error('Failed to run agent:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRunning(false);
    }
  };

  const generateInterfaceCode = (): string => {
    return `// ${config.name} - Internet Executing Agent
export async function run${config.name.replace(/\s+/g, '')}Agent(task: string, options?: {
  apiCalls?: APICall[];
  credentials?: Record<string, string>;
  rateLimit?: { requestsPerMinute: number };
  retryConfig?: { maxRetries: number; backoffMs: number };
  timeout?: number;
  parallelExecution?: boolean;
}) {
  const response = await fetch('${config.webhookUrl}', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Agent-Type': 'internet-executor'
    },
    body: JSON.stringify({
      task,
      api_calls: options?.apiCalls || ${JSON.stringify(config.apiCalls, null, 2)},
      external_apis: options?.apiCalls?.map(call => call.url) || ${JSON.stringify(config.apiCalls.map(call => call.url), null, 2)},
      web_requests: options?.apiCalls || ${JSON.stringify(config.apiCalls, null, 2)},
      credentials: options?.credentials || ${JSON.stringify(config.credentials, null, 2)},
      rate_limit: options?.rateLimit || ${JSON.stringify(config.rateLimit, null, 2)},
      retry_config: options?.retryConfig || ${JSON.stringify(config.retryConfig, null, 2)},
      timeout: options?.timeout || ${config.timeout},
      parallel_execution: options?.parallelExecution || ${config.parallelExecution},
      timestamp: new Date().toISOString(),
      request_id: \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}

interface APICall {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  description: string;
}

// Usage example:
// const result = await run${config.name.replace(/\s+/g, '')}Agent('Scrape data from multiple websites', {
//   apiCalls: [
//     { url: 'https://api.example.com/data', method: 'GET', description: 'Fetch user data' },
//     { url: 'https://api.another.com/process', method: 'POST', body: { data: 'processed' }, description: 'Process data' }
//   ],
//   credentials: { API_KEY: 'your-api-key' },
//   rateLimit: { requestsPerMinute: 30 },
//   parallelExecution: true
// });`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8" />
          Internet Executing Agent
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure agents that execute tasks across the internet via API calls
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="apis">API Calls</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="e.g., Web Scraper, Data Aggregator"
                  />
                </div>
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://your-agent.com/api/webhook"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Describe what this agent does across the internet..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="task">Default Task</Label>
                <Textarea
                  id="task"
                  value={config.task}
                  onChange={(e) => setConfig({ ...config, task: e.target.value })}
                  placeholder="e.g., Scrape data from multiple websites and aggregate results"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (req/min)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={config.rateLimit.requestsPerMinute}
                    onChange={(e) => setConfig({
                      ...config,
                      rateLimit: { requestsPerMinute: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={config.retryConfig.maxRetries}
                    onChange={(e) => setConfig({
                      ...config,
                      retryConfig: { ...config.retryConfig, maxRetries: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="parallel"
                  checked={config.parallelExecution}
                  onCheckedChange={(checked) => setConfig({ ...config, parallelExecution: checked })}
                />
                <Label htmlFor="parallel">Enable Parallel Execution</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Calls Configuration
                </span>
                <Button onClick={addAPICall} variant="outline" size="sm">
                  Add API Call
                </Button>
              </CardTitle>
              <CardDescription>
                Define the API calls this agent will make across the internet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.apiCalls.length === 0 ? (
                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    No API calls configured. Click "Add API Call" to define the external APIs this agent will use.
                  </AlertDescription>
                </Alert>
              ) : (
                config.apiCalls.map((call, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">API Call #{index + 1}</h4>
                      <Button
                        onClick={() => removeAPICall(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={call.url}
                          onChange={(e) => updateAPICall(index, 'url', e.target.value)}
                          placeholder="https://api.example.com/endpoint"
                        />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <select
                          value={call.method}
                          onChange={(e) => updateAPICall(index, 'method', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label>Description</Label>
                      <Input
                        value={call.description}
                        onChange={(e) => updateAPICall(index, 'description', e.target.value)}
                        placeholder="What does this API call do?"
                      />
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Credentials
                </span>
                <Button onClick={addCredential} variant="outline" size="sm">
                  Add Credential
                </Button>
              </CardTitle>
              <CardDescription>
                Manage API keys and credentials for external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(config.credentials).length === 0 ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    No credentials configured. Add API keys and tokens for external services.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {Object.entries(config.credentials).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{key}</div>
                        <div className="text-sm text-muted-foreground">
                          {value.substring(0, 8)}...
                        </div>
                      </div>
                      <Button
                        onClick={() => removeCredential(key)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated TypeScript Interface</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(generateInterfaceCode())}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </CardTitle>
              <CardDescription>
                Copy the generated TypeScript interface for your agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateInterfaceCode()}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Test Agent</CardTitle>
          <CardDescription>
            Run your internet-executing agent to test its configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAgent} 
            disabled={isRunning || !config.name || !config.webhookUrl}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing Across Internet...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Run Internet Agent
              </>
            )}
          </Button>

          {results && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Results:</h4>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 