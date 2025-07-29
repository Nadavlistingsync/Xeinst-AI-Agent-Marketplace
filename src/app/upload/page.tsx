"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AIInterfaceGenerator from "@/components/AIInterfaceGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Upload, 
  Code, 
  Settings, 
  FileText, 
  Zap, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Webhook,
  TestTube,
  Globe
} from "lucide-react";

interface AgentData {
  name: string;
  description: string;
  category: string;
  price: string;
  webhookUrl: string;
  documentation: string;
  version: string;
  environment: string;
  framework: string;
  modelType: string;
  inputSchema: string;
  exampleInputs: string;
  inputTypes: string[];
  supportsStreaming: boolean;
  supportsEmailCallback: boolean;
}

interface WebEmbedData {
  name: string;
  description: string;
  url: string;
  embedUrl: string;
  type: 'tool' | 'application' | 'dashboard' | 'website' | 'custom';
  width: string;
  height: string;
  allowFullscreen: boolean;
  allowScripts: boolean;
  sandbox: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState<'agent' | 'web-embed' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedAgentId, setUploadedAgentId] = useState<string | null>(null);
  const [showInterfaceGenerator, setShowInterfaceGenerator] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [isWebhookValid, setIsWebhookValid] = useState(false);
  
  const [formData, setFormData] = useState<AgentData>({
    name: "",
    category: "",
    description: "",
    price: "0",
    webhookUrl: "",
    documentation: "",
    version: "1.0.0",
    environment: "production",
    framework: "custom",
    modelType: "custom",
    inputSchema: `{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Input for the agent"
    }
  },
  "required": ["input"]
}`,
    exampleInputs: `{
  "input": "Hello, this is a test input"
}`,
    inputTypes: [],
    supportsStreaming: false,
    supportsEmailCallback: false,
  });

  const [webEmbedData, setWebEmbedData] = useState<WebEmbedData>({
    name: "",
    description: "",
    url: "",
    embedUrl: "",
    type: 'tool',
    width: '100%',
    height: '600px',
    allowFullscreen: true,
    allowScripts: false,
    sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups',
  });

  const predefinedCategories = [
    "Data Processing",
    "Text Analysis", 
    "Image Processing",
    "API Integration",
    "Automation",
    "Analytics",
    "Communication",
    "Custom"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWebEmbedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWebEmbedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      inputTypes: prev.inputTypes.includes(type)
        ? prev.inputTypes.filter(t => t !== type)
        : [...prev.inputTypes, type]
    }));
  };

  const handleAdvancedOptionChange = (option: 'supportsStreaming' | 'supportsEmailCallback') => {
    setFormData((prev) => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleUploadTypeSelect = (type: 'agent' | 'web-embed') => {
    setUploadType(type);
    setCurrentStep(1);
  };

  const handleStep1Validation = () => {
    if (uploadType === 'agent') {
      if (!formData.name || !formData.category || !formData.description) {
        setError("Please fill in all required fields");
        return false;
      }
    } else if (uploadType === 'web-embed') {
      if (!webEmbedData.name || !webEmbedData.url || !webEmbedData.embedUrl) {
        setError("Please fill in all required fields");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleStep2Validation = () => {
    if (uploadType === 'agent') {
      if (!formData.webhookUrl) {
        setError("Please provide a webhook URL");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleStep3Validation = () => {
    if (uploadType === 'agent') {
      if (!formData.inputSchema || !formData.exampleInputs) {
        setError("Please provide input schema and example inputs");
        return false;
      }
    }
    setError("");
    return true;
  };

  const testWebhook = async () => {
    if (!formData.webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/agents/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: formData.webhookUrl,
          testInput: formData.exampleInputs
        })
      });

      const result = await response.json();
      setWebhookTestResult(result);
      setIsWebhookValid(result.success);
      
      if (result.success) {
        toast.success("Webhook test successful!");
      } else {
        toast.error("Webhook test failed");
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error("Failed to test webhook");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (uploadType === 'agent') {
      if (!handleStep1Validation() || !handleStep2Validation() || !handleStep3Validation()) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to upload agent');
        }

        const result = await response.json();
        setUploadedAgentId(result.agent.id);
        toast.success("Agent uploaded successfully!");
        setShowInterfaceGenerator(true);
      } catch (error) {
        console.error('Error uploading agent:', error);
        toast.error("Failed to upload agent");
      } finally {
        setLoading(false);
      }
    } else if (uploadType === 'web-embed') {
      if (!handleStep1Validation()) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/web-embeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webEmbedData)
        });

        if (!response.ok) {
          throw new Error('Failed to create web embed');
        }

        toast.success("Web embed created successfully!");
        router.push('/web-embeds');
      } catch (error) {
        console.error('Error creating web embed:', error);
        toast.error("Failed to create web embed");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetSetup = () => {
    setCurrentStep(0);
    setUploadType(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "0",
      webhookUrl: "",
      documentation: "",
      version: "1.0.0",
      environment: "production",
      framework: "custom",
      modelType: "custom",
      inputSchema: `{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Input for the agent"
    }
  },
  "required": ["input"]
}`,
      exampleInputs: `{
  "input": "Hello, this is a test input"
}`,
      inputTypes: [],
      supportsStreaming: false,
      supportsEmailCallback: false,
    });
    setWebEmbedData({
      name: "",
      description: "",
      url: "",
      embedUrl: "",
      type: 'tool',
      width: '100%',
      height: '600px',
      allowFullscreen: true,
      allowScripts: false,
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups',
    });
    setError("");
    setWebhookTestResult(null);
    setIsWebhookValid(false);
  };

  const progress = uploadType ? ((currentStep + 1) / (uploadType === 'agent' ? 4 : 2)) * 100 : 0;

  if (showInterfaceGenerator && uploadedAgentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🎉 Agent Uploaded Successfully!
            </h1>
            <p className="text-xl text-muted-foreground">
              Now let's create a beautiful AI-powered interface for your agent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AIInterfaceGenerator />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Agent Uploaded</p>
                      <p className="text-sm text-muted-foreground">Your agent is now in the marketplace</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Generate Interface</p>
                      <p className="text-sm text-muted-foreground">Create a professional UI for your agent</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Deploy & Share</p>
                      <p className="text-sm text-muted-foreground">Your agent will be live in the marketplace</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Choose a theme that matches your brand</li>
                    <li>• Test different layouts for best UX</li>
                    <li>• Enable features your users will need</li>
                    <li>• Download the React code for customization</li>
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={() => router.push('/marketplace')}
                variant="outline"
                className="w-full"
              >
                Skip & Go to Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {uploadType === 'agent' ? 'Upload Agent to Marketplace' : uploadType === 'web-embed' ? 'Create Web Embed' : 'Choose Upload Type'}
                </CardTitle>
                <CardDescription>
                  {uploadType === 'agent' 
                    ? 'Create and deploy your webhook-based AI agent in 4 simple steps'
                    : uploadType === 'web-embed'
                    ? 'Embed existing tools/agents without full setup - paste link and deploy'
                    : 'Choose between uploading a full agent or creating a web embed'
                  }
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">
                  Step {currentStep + 1} of {uploadType === 'agent' ? 4 : uploadType === 'web-embed' ? 2 : 1}
                </div>
                <Progress value={progress} className="w-32" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Step 0: Choose Upload Type */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Upload Type</h2>
              <p className="text-muted-foreground">Select how you want to add your AI solution to the platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Agent Option */}
              <Card className="hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer"
                     onClick={() => handleUploadTypeSelect('agent')}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Upload Full Agent</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create and upload a complete AI agent with webhook integration, input schema, and full functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Complete agent with webhook</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Input schema & validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Full marketplace integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Analytics & monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Web Embed Option */}
              <Card className="hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer"
                     onClick={() => handleUploadTypeSelect('web-embed')}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Create Web Embed</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Embed existing tools/agents without full setup - paste link and deploy instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Quick setup - no full agent needed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Paste existing tool/agent URL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant deployment via iframe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Basic tracking & analytics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && uploadType === 'agent' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 1: Basic Information
              </CardTitle>
              <CardDescription>
                Provide the essential details about your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="My AI Agent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select a category</option>
                    {predefinedCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what your agent does and how it helps users..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version</label>
                  <Input
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetSetup}>
                  Start Over
                </Button>
                <Button onClick={() => {
                  if (handleStep1Validation()) {
                    setCurrentStep(2);
                  }
                }}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Web Embed Information */}
        {currentStep === 1 && uploadType === 'web-embed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Step 1: Web Embed Information
              </CardTitle>
              <CardDescription>
                Provide details about the tool/agent you want to embed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Embed Name *</label>
                  <Input
                    name="name"
                    value={webEmbedData.name}
                    onChange={handleWebEmbedChange}
                    placeholder="My Tool Embed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={webEmbedData.type}
                    onChange={handleWebEmbedChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="tool">Tool</option>
                    <option value="application">Application</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="website">Website</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={webEmbedData.description}
                  onChange={handleWebEmbedChange}
                  placeholder="Describe what this tool/agent does and what AI functionality you want to add..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Original Tool URL *</label>
                  <Input
                    name="url"
                    value={webEmbedData.url}
                    onChange={handleWebEmbedChange}
                    placeholder="https://example-tool.com"
                  />
                  <p className="text-xs text-muted-foreground">The original tool/agent URL you want to embed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Embed URL *</label>
                  <Input
                    name="embedUrl"
                    value={webEmbedData.embedUrl}
                    onChange={handleWebEmbedChange}
                    placeholder="https://example-tool.com/embed"
                  />
                  <p className="text-xs text-muted-foreground">The URL to embed (iframe src) - can be the same as original URL</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width</label>
                  <Input
                    name="width"
                    value={webEmbedData.width}
                    onChange={handleWebEmbedChange}
                    placeholder="100%"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height</label>
                  <Input
                    name="height"
                    value={webEmbedData.height}
                    onChange={handleWebEmbedChange}
                    placeholder="600px"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetSetup}>
                  Start Over
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Web Embed
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Webhook Configuration (Agent only) */}
        {currentStep === 2 && uploadType === 'agent' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Step 2: Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure your agent's webhook endpoint and test the connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL *</label>
                <Input
                  name="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-api.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  The endpoint where your agent will receive requests
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Documentation URL</label>
                <Input
                  name="documentation"
                  value={formData.documentation}
                  onChange={handleInputChange}
                  placeholder="https://your-docs.com"
                />
                <p className="text-xs text-muted-foreground">
                  Link to your agent's documentation (optional)
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={testWebhook} disabled={loading || !formData.webhookUrl}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Webhook
                    </>
                  )}
                </Button>
                {isWebhookValid && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Valid
                  </Badge>
                )}
              </div>

              {webhookTestResult && (
                <Alert>
                  <TestTube className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Test Result:</strong> {webhookTestResult.message}
                    {webhookTestResult.response && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded">
                        {JSON.stringify(webhookTestResult.response, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
                <Button onClick={() => {
                  if (handleStep2Validation()) {
                    setCurrentStep(3);
                  }
                }}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Input Schema (Agent only) */}
        {currentStep === 3 && uploadType === 'agent' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Step 3: Input Schema
              </CardTitle>
              <CardDescription>
                Define the structure of inputs your agent expects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Schema (JSON) *</label>
                <Textarea
                  name="inputSchema"
                  value={formData.inputSchema}
                  onChange={handleInputChange}
                  placeholder="Define your input schema..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JSON schema defining the structure of inputs your agent accepts
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Example Inputs (JSON) *</label>
                <Textarea
                  name="exampleInputs"
                  value={formData.exampleInputs}
                  onChange={handleInputChange}
                  placeholder="Provide example inputs..."
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Sample inputs that users can try with your agent
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supported Input Types</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['text', 'image', 'file', 'audio', 'video', 'json', 'xml', 'csv'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.inputTypes.includes(type)}
                        onChange={() => handleInputTypeChange(type)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Advanced Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.supportsStreaming}
                      onChange={() => handleAdvancedOptionChange('supportsStreaming')}
                      className="rounded"
                    />
                    <span className="text-sm">Supports Streaming Responses</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.supportsEmailCallback}
                      onChange={() => handleAdvancedOptionChange('supportsEmailCallback')}
                      className="rounded"
                    />
                    <span className="text-sm">Supports Email Callback</span>
                  </label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Previous
                </Button>
                <Button onClick={() => {
                  if (handleStep3Validation()) {
                    setCurrentStep(4);
                  }
                }}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit (Agent only) */}
        {currentStep === 4 && uploadType === 'agent' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 4: Review & Submit
              </CardTitle>
              <CardDescription>
                Review your agent details and submit to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Price:</strong> ${formData.price}</p>
                    <p><strong>Version:</strong> {formData.version}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Technical Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Webhook:</strong> {formData.webhookUrl}</p>
                    <p><strong>Framework:</strong> {formData.framework}</p>
                    <p><strong>Environment:</strong> {formData.environment}</p>
                    <p><strong>Input Types:</strong> {formData.inputTypes.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{formData.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Advanced Features</h4>
                <div className="flex space-x-4 text-sm">
                  <span className={`flex items-center ${formData.supportsStreaming ? 'text-green-500' : 'text-gray-500'}`}>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Streaming
                  </span>
                  <span className={`flex items-center ${formData.supportsEmailCallback ? 'text-green-500' : 'text-gray-500'}`}>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Email Callback
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Previous
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload to Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 