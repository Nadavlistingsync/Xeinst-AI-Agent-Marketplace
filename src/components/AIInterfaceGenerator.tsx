"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Settings, Play, Download } from 'lucide-react';

interface AgentConfig {
  name: string;
  description: string;
  webhookUrl: string;
  agentType: 'text-input' | 'file-upload' | 'streaming' | 'async-task' | 'multi-step' | 'structured-data' | 'internet-executor';
  inputSchema?: any;
  outputSchema?: any;
  settings?: {
    timeout?: number;
    retries?: number;
    streaming?: boolean;
    async?: boolean;
  };
}

interface GeneratedInterface {
  config: AgentConfig;
  interfaceCode: string;
  documentation: string;
}

export default function AIInterfaceGenerator() {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    webhookUrl: '',
    agentType: 'text-input',
    settings: {
      timeout: 30000,
      retries: 3,
      streaming: false,
      async: false,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInterface, setGeneratedInterface] = useState<GeneratedInterface | null>(null);

  const agentTypeOptions = [
    { value: 'text-input', label: 'Text Input', description: 'Simple text-based agents' },
    { value: 'file-upload', label: 'File Upload', description: 'Agents that process files' },
    { value: 'streaming', label: 'Streaming', description: 'Real-time streaming responses' },
    { value: 'async-task', label: 'Async Task', description: 'Long-running background tasks' },
    { value: 'multi-step', label: 'Multi-Step', description: 'Complex workflow agents' },
    { value: 'structured-data', label: 'Structured Data', description: 'Agents with complex data schemas' },
    { value: 'internet-executor', label: 'Internet Executor', description: 'Agents that execute tasks across the internet via API calls' },
  ];

  const generateInterface = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate interface
      await new Promise(resolve => setTimeout(resolve, 2000));

      const interfaceCode = generateInterfaceCode(agentConfig);
      const documentation = generateDocumentation(agentConfig);

      setGeneratedInterface({
        config: agentConfig,
        interfaceCode,
        documentation,
      });
    } catch (error) {
      console.error('Failed to generate interface:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInterfaceCode = (config: AgentConfig): string => {
    const { name, agentType, webhookUrl, settings } = config;
    
    switch (agentType) {
      case 'text-input':
        return `// ${name} - Text Input Agent
export async function run${name.replace(/\s+/g, '')}Agent(input: string) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}`;

      case 'file-upload':
        return `// ${name} - File Upload Agent
export async function run${name.replace(/\s+/g, '')}Agent(input: string, files: File[]) {
  const formData = new FormData();
  formData.append('input', input);
  
  files.forEach((file, index) => {
    formData.append(\`file_\${index}\`, file);
  });
  
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}`;

      case 'streaming':
        return `// ${name} - Streaming Agent
export async function run${name.replace(/\s+/g, '')}Agent(input: string, onChunk: (chunk: string) => void) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ input, stream: true })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        onChunk(data);
      }
    }
  }
}`;

      case 'async-task':
        return `// ${name} - Async Task Agent
export async function run${name.replace(/\s+/g, '')}Agent(input: string) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      input, 
      async: true,
      callback_url: 'https://your-domain.com/api/webhook/callback'
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  const result = await response.json();
  return { jobId: result.job_id, status: 'pending' };
}

export async function check${name.replace(/\s+/g, '')}Status(jobId: string) {
  const response = await fetch(\`${webhookUrl}/status/\${jobId}\`);
  return await response.json();
}`;

      case 'multi-step':
        return `// ${name} - Multi-Step Workflow Agent
export async function run${name.replace(/\s+/g, '')}Agent(workflow: any[], context: any = {}) {
  const sessionId = \`session_\${Date.now()}\`;
  
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow,
      context,
      session_id: sessionId
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}`;

      case 'structured-data':
        return `// ${name} - Structured Data Agent
export async function run${name.replace(/\s+/g, '')}Agent(data: any) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      request_id: \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}`;

      case 'internet-executor':
        return `// ${name} - Internet Executing Agent
export async function run${name.replace(/\s+/g, '')}Agent(task: string, options?: {
  apiCalls?: APICall[];
  credentials?: Record<string, string>;
  rateLimit?: { requestsPerMinute: number };
  retryConfig?: { maxRetries: number; backoffMs: number };
  timeout?: number;
  parallelExecution?: boolean;
}) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Agent-Type': 'internet-executor'
    },
    body: JSON.stringify({
      task,
      api_calls: options?.apiCalls || [],
      external_apis: options?.apiCalls?.map(call => call.url) || [],
      web_requests: options?.apiCalls || [],
      credentials: options?.credentials || {},
      rate_limit: options?.rateLimit || { requests_per_minute: 60 },
      retry_config: options?.retryConfig || { max_retries: 3, backoff_ms: 1000 },
      timeout: options?.timeout || 30000,
      parallel_execution: options?.parallelExecution || false,
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
}`;

      default:
        return `// ${name} - Generic Agent
export async function run${name.replace(/\s+/g, '')}Agent(inputs: any) {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });
  
  if (!response.ok) {
    throw new Error(\`Agent failed: \${response.status}\`);
  }
  
  return await response.json();
}`;
    }
  };

  const generateDocumentation = (config: AgentConfig): string => {
    const { name, description, agentType, webhookUrl, settings } = config;
    
    return `# ${name}

${description}

## Agent Type
${agentTypeOptions.find(opt => opt.value === agentType)?.description}

## Webhook URL
\`${webhookUrl}\`

## Configuration
- **Timeout**: ${settings?.timeout || 30000}ms
- **Retries**: ${settings?.retries || 3}
- **Streaming**: ${settings?.streaming ? 'Enabled' : 'Disabled'}
- **Async**: ${settings?.async ? 'Enabled' : 'Disabled'}

## Usage Examples

${generateUsageExamples(agentType, name)}

## Error Handling
The agent will throw an error if the webhook responds with a non-200 status code.

## Rate Limiting
Consider implementing rate limiting for production use.

## Security
Ensure your webhook URL is secure and uses HTTPS in production.`;
  };

  const generateUsageExamples = (agentType: string, name: string): string => {
    switch (agentType) {
      case 'text-input':
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

const result = await run${name.replace(/\s+/g, '')}Agent('Your input text here');
console.log(result);
\`\`\``;

      case 'file-upload':
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

const fileInput = document.getElementById('fileInput');
const files = Array.from(fileInput.files);
const result = await run${name.replace(/\s+/g, '')}Agent('Process these files', files);
console.log(result);
\`\`\``;

      case 'streaming':
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

await run${name.replace(/\s+/g, '')}Agent('Your input', (chunk) => {
  console.log('Received chunk:', chunk);
});
\`\`\``;

      case 'async-task':
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent, check${name.replace(/\s+/g, '')}Status } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

// Start the task
const { jobId } = await run${name.replace(/\s+/g, '')}Agent('Your input');

// Check status periodically
const status = await check${name.replace(/\s+/g, '')}Status(jobId);
console.log('Task status:', status);
\`\`\``;

      case 'internet-executor':
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

const result = await run${name.replace(/\s+/g, '')}Agent('Scrape data from multiple websites', {
  apiCalls: [
    { url: 'https://api.example.com/data', method: 'GET', description: 'Fetch user data' },
    { url: 'https://api.another.com/process', method: 'POST', body: { data: 'processed' }, description: 'Process data' }
  ],
  credentials: { API_KEY: 'your-api-key' },
  rateLimit: { requestsPerMinute: 30 },
  parallelExecution: true
});
console.log(result);
\`\`\``;

      default:
        return `\`\`\`javascript
import { run${name.replace(/\s+/g, '')}Agent } from './agents/${name.toLowerCase().replace(/\s+/g, '-')}';

const result = await run${name.replace(/\s+/g, '')}Agent({ your: 'data' });
console.log(result);
\`\`\``;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Agent Interface Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate TypeScript interfaces for any AI agent type
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI agent to generate the appropriate interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={agentConfig.name}
                onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                placeholder="e.g., Data Scraper, Image Generator"
              />
            </div>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={agentConfig.webhookUrl}
                onChange={(e) => setAgentConfig({ ...agentConfig, webhookUrl: e.target.value })}
                placeholder="https://your-agent.com/api/webhook"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={agentConfig.description}
              onChange={(e) => setAgentConfig({ ...agentConfig, description: e.target.value })}
              placeholder="Describe what this agent does..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="agentType">Agent Type</Label>
            <Select
              value={agentConfig.agentType}
              onValueChange={(value: any) => setAgentConfig({ ...agentConfig, agentType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={agentConfig.settings?.timeout || 30000}
                onChange={(e) => setAgentConfig({
                  ...agentConfig,
                  settings: { ...agentConfig.settings, timeout: parseInt(e.target.value) }
                })}
              />
            </div>
            <div>
              <Label htmlFor="retries">Retries</Label>
              <Input
                id="retries"
                type="number"
                value={agentConfig.settings?.retries || 3}
                onChange={(e) => setAgentConfig({
                  ...agentConfig,
                  settings: { ...agentConfig.settings, retries: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="streaming"
                checked={agentConfig.settings?.streaming || false}
                onCheckedChange={(checked) => setAgentConfig({
                  ...agentConfig,
                  settings: { ...agentConfig.settings, streaming: checked }
                })}
              />
              <Label htmlFor="streaming">Enable Streaming</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="async"
                checked={agentConfig.settings?.async || false}
                onCheckedChange={(checked) => setAgentConfig({
                  ...agentConfig,
                  settings: { ...agentConfig.settings, async: checked }
                })}
              />
              <Label htmlFor="async">Enable Async Processing</Label>
            </div>
          </div>

          <Button 
            onClick={generateInterface} 
            disabled={isGenerating || !agentConfig.name || !agentConfig.webhookUrl}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Interface...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Interface
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedInterface && (
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Interface Code</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated TypeScript Interface</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(generatedInterface.interfaceCode)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generatedInterface.interfaceCode}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                  {generatedInterface.documentation}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Preview</CardTitle>
                <CardDescription>
                  Test your generated agent interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{generatedInterface.config.agentType}</Badge>
                    <Badge variant="secondary">{generatedInterface.config.name}</Badge>
                  </div>
                  
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      This agent is configured for <strong>{agentTypeOptions.find(opt => opt.value === generatedInterface.config.agentType)?.label}</strong>.
                      Use the generated interface code to integrate it into your application.
                    </AlertDescription>
                  </Alert>

                  <div className="text-sm text-muted-foreground">
                    <p><strong>Webhook URL:</strong> {generatedInterface.config.webhookUrl}</p>
                    <p><strong>Timeout:</strong> {generatedInterface.config.settings?.timeout}ms</p>
                    <p><strong>Retries:</strong> {generatedInterface.config.settings?.retries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 