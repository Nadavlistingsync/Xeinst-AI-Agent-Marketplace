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
  Palette
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

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleInputTypeChange = (type: string) => {
    setFormData((prev) => {
      const inputTypes = prev.inputTypes.includes(type)
        ? prev.inputTypes.filter((t) => t !== type)
        : [...prev.inputTypes, type];
      return { ...prev, inputTypes };
    });
  };

  const handleAdvancedOptionChange = (option: 'supportsStreaming' | 'supportsEmailCallback') => {
    setFormData((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleStep1Validation = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError("Please fill in all required fields");
      return false;
    }
    setError("");
    setCurrentStep(2);
    return true;
  };

  const handleStep2Validation = () => {
    if (!formData.webhookUrl.trim()) {
      setError("Please provide a webhook URL");
      return false;
    }
    
    try {
      new URL(formData.webhookUrl);
    } catch {
      setError("Please provide a valid webhook URL");
      return false;
    }
    
    setError("");
    setCurrentStep(3);
    return true;
  };

  const handleStep3Validation = () => {
    try {
      JSON.parse(formData.inputSchema);
      JSON.parse(formData.exampleInputs);
    } catch (err) {
      setError("Please provide valid JSON for input schema and example inputs");
      return false;
    }
    
    setError("");
    setCurrentStep(4);
    return true;
  };

  const testWebhook = async () => {
    if (!formData.webhookUrl.trim()) {
      setError("Please provide a webhook URL first");
      return;
    }

    setLoading(true);
    setError("");
    setWebhookTestResult(null);

    try {
      let parsedInputs;
      try {
        parsedInputs = JSON.parse(formData.exampleInputs);
      } catch (e) {
        throw new Error('Invalid JSON in example inputs');
      }

      const response = await fetch('/api/run-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'test-agent',
          inputs: parsedInputs,
          webhookUrl: formData.webhookUrl, // Pass webhook URL for testing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test webhook');
      }

      setWebhookTestResult(data);
      setIsWebhookValid(true);
      toast.success('Webhook test successful!');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMsg);
      setIsWebhookValid(false);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate JSON schema and inputs
      let parsedSchema, parsedInputs;
      try {
        parsedSchema = JSON.parse(formData.inputSchema);
        parsedInputs = JSON.parse(formData.exampleInputs);
      } catch (err) {
        throw new Error('Invalid JSON format in schema or inputs');
      }

      const config = {
        inputTypes: formData.inputTypes,
        formSchema: parsedSchema,
        supportsStreaming: formData.supportsStreaming,
        supportsEmailCallback: formData.supportsEmailCallback,
      };

      const agentData = {
        ...formData,
        price: parseFloat(formData.price),
        inputSchema: parsedSchema,
        exampleInputs: parsedInputs,
        webhookUrl: formData.webhookUrl,
        config,
      };

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload agent');
      }

      const result = await response.json();
      setUploadedAgentId(result.id);
      setShowInterfaceGenerator(true);
      toast.success('Agent uploaded successfully! Now generate your AI interface.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetSetup = () => {
    setCurrentStep(1);
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
    setError("");
    setWebhookTestResult(null);
    setIsWebhookValid(false);
  };

  const progress = (currentStep / 4) * 100;

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
                  Upload Agent to Marketplace
                </CardTitle>
                <CardDescription>
                  Create and deploy your webhook-based AI agent in 4 simple steps
                </CardDescription>
              </div>
              <Badge variant="outline">Step {currentStep} of 4</Badge>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 1: Agent Information
              </CardTitle>
              <CardDescription>
                Provide basic information about your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Text Summarizer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
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
                  placeholder="Describe what your agent does..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Documentation</label>
                <Textarea
                  name="documentation"
                  value={formData.documentation}
                  onChange={handleInputChange}
                  placeholder="Provide usage instructions, examples, and any important notes..."
                  rows={4}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={handleStep1Validation}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Webhook Configuration */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Step 2: Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure your agent's webhook endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL *</label>
                <Input
                  name="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="https://api.example.com/your-agent"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This is the endpoint where your agent will receive requests and return responses
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version</label>
                  <Input
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="1.0.0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Environment</label>
                  <Input
                    name="environment"
                    value={formData.environment}
                    onChange={handleInputChange}
                    placeholder="production"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Framework</label>
                  <Input
                    name="framework"
                    value={formData.framework}
                    onChange={handleInputChange}
                    placeholder="custom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (credits per run)</label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleStep2Validation}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Input Configuration */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Step 3: Input Configuration
              </CardTitle>
              <CardDescription>
                Define the input schema, select input types, and test your webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input JSON Schema *</label>
                <Textarea
                  name="inputSchema"
                  value={formData.inputSchema}
                  onChange={handleInputChange}
                  placeholder="Define the JSON schema for your agent's input..."
                  rows={6}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Define the structure and validation rules for the input your agent expects
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Example Inputs *</label>
                <Textarea
                  name="exampleInputs"
                  value={formData.exampleInputs}
                  onChange={handleInputChange}
                  placeholder="Example inputs for testing..."
                  rows={4}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide example inputs that will be used to test your webhook
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supported Input Types *</label>
                <div className="flex flex-wrap gap-4">
                  {['text', 'form', 'webhook', 'file', 'button'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inputTypes.includes(type)}
                        onChange={() => handleInputTypeChange(type)}
                        className="accent-primary"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select all input types your agent supports. Most agents should support at least one.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Advanced Options</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.supportsStreaming}
                      onChange={() => handleAdvancedOptionChange('supportsStreaming')}
                      className="accent-primary"
                    />
                    Streaming Output
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.supportsEmailCallback}
                      onChange={() => handleAdvancedOptionChange('supportsEmailCallback')}
                      className="accent-primary"
                    />
                    Email Callback
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable if your agent supports streaming output or email callbacks for long tasks.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Test Your Webhook</h4>
                  <Button 
                    onClick={testWebhook} 
                    disabled={loading || !formData.webhookUrl}
                    size="sm"
                  >
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
                </div>

                {webhookTestResult && (
                  <Alert variant={isWebhookValid ? "default" : "destructive"}>
                    {isWebhookValid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">
                          {isWebhookValid ? '✅ Webhook Test Successful' : '❌ Webhook Test Failed'}
                        </div>
                        {webhookTestResult.webhookStatus && (
                          <div className="text-sm">
                            <strong>Status:</strong> {webhookTestResult.webhookStatus}
                          </div>
                        )}
                        {webhookTestResult.result && (
                          <div className="text-sm">
                            <strong>Response:</strong>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(webhookTestResult.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleStep3Validation} disabled={!isWebhookValid}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Upload */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 4: Review & Upload
              </CardTitle>
              <CardDescription>
                Review your agent configuration and upload to marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Configuration Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {formData.name}
                  </div>
                  <div>
                    <strong>Category:</strong> {formData.category}
                  </div>
                  <div>
                    <strong>Webhook URL:</strong> {formData.webhookUrl}
                  </div>
                  <div>
                    <strong>Price:</strong> {formData.price} credits
                  </div>
                  <div className="md:col-span-2">
                    <strong>Description:</strong> {formData.description}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Input Schema:</strong>
                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                      {formData.inputSchema}
                    </pre>
                  </div>
                  <div className="md:col-span-2">
                    <strong>Supported Input Types:</strong> {formData.inputTypes.join(', ') || 'None selected'}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Advanced Options:</strong> {[
                      formData.supportsStreaming ? 'Streaming Output' : null,
                      formData.supportsEmailCallback ? 'Email Callback' : null
                    ].filter(Boolean).join(', ') || 'None'}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2">
                  🎉 Ready to Upload!
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Your webhook has been tested and is working</li>
                  <li>• Input schema is properly configured</li>
                  <li>• Agent will be available in the marketplace</li>
                  <li>• AI interface will be generated automatically</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back to Configuration
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Agent...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Agent & Generate Interface
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetSetup}>
                <Palette className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Button variant="outline" onClick={() => router.push('/marketplace')}>
                Browse Marketplace
              </Button>
              <Button variant="outline" onClick={() => router.push('/test-webhook')}>
                <TestTube className="mr-2 h-4 w-4" />
                Test Webhooks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 