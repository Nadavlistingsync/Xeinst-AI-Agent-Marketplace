"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  DollarSign,
  Sparkles,
  Rocket,
  Copy,
  Download
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

interface SimpleAgentData {
  name: string;
  description: string;
  webhookUrl: string;
  price: string;
  inputType: string;
  inputDescription: string;
}

export default function EasyUploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [generatedJson, setGeneratedJson] = useState<string>("");
  
  const [formData, setFormData] = useState<SimpleAgentData>({
    name: "",
    description: "",
    webhookUrl: "",
    price: "0",
    inputType: "text",
    inputDescription: "Input text"
  });

  const inputTypes = [
    { value: "text", label: "Text Input", description: "Simple text input" },
    { value: "textarea", label: "Long Text", description: "Multi-line text input" },
    { value: "number", label: "Number", description: "Numeric input" },
    { value: "email", label: "Email", description: "Email address input" },
    { value: "url", label: "URL", description: "Website URL input" },
    { value: "file", label: "File Upload", description: "File upload input" }
  ];

  const generateJson = () => {
    const category = getCategoryFromDescription(formData.description);
    const inputSchema = generateInputSchema(formData.inputType, formData.inputDescription);
    
    const agentJson = {
      name: formData.name,
      description: formData.description,
      category: category,
      price: parseFloat(formData.price),
      webhookUrl: formData.webhookUrl,
      version: "1.0.0",
      environment: "production",
      framework: "custom",
      modelType: "custom",
      inputSchema: inputSchema,
      exampleInputs: generateExampleInputs(formData.inputType),
      documentation: `This agent ${formData.description.toLowerCase()}. Simply provide the required input and get instant results.`
    };

    return JSON.stringify(agentJson, null, 2);
  };

  const getCategoryFromDescription = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('text') || desc.includes('summar') || desc.includes('analyze')) return "Text Analysis";
    if (desc.includes('image') || desc.includes('photo') || desc.includes('picture')) return "Image Processing";
    if (desc.includes('data') || desc.includes('csv') || desc.includes('process')) return "Data Processing";
    if (desc.includes('api') || desc.includes('webhook') || desc.includes('integrate')) return "API Integration";
    if (desc.includes('automate') || desc.includes('workflow')) return "Automation";
    if (desc.includes('email') || desc.includes('message') || desc.includes('chat')) return "Communication";
    if (desc.includes('analytics') || desc.includes('report') || desc.includes('metrics')) return "Analytics";
    return "Other";
  };

  const generateInputSchema = (inputType: string, description: string) => {
    const baseSchema = {
      type: "object",
      properties: {
        input: {
          type: getJsonSchemaType(inputType),
          description: description
        }
      },
      required: ["input"]
    };

    // Add specific constraints based on input type
    switch (inputType) {
      case "number":
        return {
          ...baseSchema,
          properties: {
            input: {
              ...baseSchema.properties.input,
              minimum: 0
            }
          }
        };
      case "email":
        return {
          ...baseSchema,
          properties: {
            input: {
              ...baseSchema.properties.input,
              format: "email"
            }
          }
        };
      case "url":
        return {
          ...baseSchema,
          properties: {
            input: {
              ...baseSchema.properties.input,
              format: "uri"
            }
          }
        };
      case "file":
        return {
          ...baseSchema,
          properties: {
            input: {
              ...baseSchema.properties.input,
              format: "data-url"
            }
          }
        };
      default:
        return baseSchema;
    }
  };

  const getJsonSchemaType = (inputType: string): string => {
    switch (inputType) {
      case "number": return "number";
      case "file": return "string";
      default: return "string";
    }
  };

  const generateExampleInputs = (inputType: string) => {
    switch (inputType) {
      case "text":
        return { input: "Hello, this is a sample text input" };
      case "textarea":
        return { input: "This is a longer text input that can span multiple lines and contain more detailed information." };
      case "number":
        return { input: 42 };
      case "email":
        return { input: "user@example.com" };
      case "url":
        return { input: "https://example.com" };
      case "file":
        return { input: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" };
      default:
        return { input: "Sample input" };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.webhookUrl) {
        setError("Please fill in all required fields");
        return;
      }

      const agentJson = generateJson();
      setGeneratedJson(agentJson);

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: agentJson
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload agent');
      }

      const result = await response.json();
      setAgentId(result.agent.id);
      setSuccess(true);
      toast.success("🎉 Agent uploaded successfully!");
      
      // Auto-advance to success step
      setTimeout(() => setStep(3), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload agent');
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(generatedJson);
    toast.success("JSON copied to clipboard!");
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, '-').toLowerCase()}-agent.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded!");
  };

  const progress = ((step + 1) / 4) * 100;

  if (success && agentId) {
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
              🎉 Agent Created Successfully!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your AI agent is now live and ready to earn credits!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Live in Marketplace</CardTitle>
                <CardDescription>Your agent is now discoverable by users worldwide</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Start Earning</CardTitle>
                <CardDescription>You'll earn credits every time someone uses your agent</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Auto-Generated</CardTitle>
                <CardDescription>All JSON was automatically created for you</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <Button 
              size="lg" 
              className="bg-gradient-ai hover:bg-gradient-ai/90 text-white px-8 py-4 text-lg"
              onClick={() => router.push('/marketplace')}
            >
              View in Marketplace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep(0);
                  setSuccess(false);
                  setFormData({
                    name: "",
                    description: "",
                    webhookUrl: "",
                    price: "0",
                    inputType: "text",
                    inputDescription: "Input text"
                  });
                }}
              >
                Create Another Agent
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
          <h1 className="text-4xl font-bold text-white mb-2">Super Easy Agent Upload</h1>
          <p className="text-muted-foreground">Just answer 4 simple questions and we'll create everything for you!</p>
        </motion.div>

        {/* Progress Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Create Your AI Agent
                </CardTitle>
                <CardDescription>
                  {step === 0 && "Tell us about your agent"}
                  {step === 1 && "Configure your webhook"}
                  {step === 2 && "Review and submit"}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">
                  Step {step + 1} of 3
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-ai transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Step 0: Basic Information */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Step 1: What does your agent do?
                </CardTitle>
                <CardDescription>
                  Tell us about your agent in simple terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Agent Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Text Summarizer, Image Analyzer, Data Processor"
                    className="bg-background/50 border-input/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">What does it do? *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Summarizes long text into key points, Analyzes images and tells you what's in them, Processes CSV data and finds patterns..."
                    rows={3}
                    className="bg-background/50 border-input/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">What type of input does it need?</label>
                  <select
                    name="inputType"
                    value={formData.inputType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input/50 bg-background/50 rounded-md text-sm text-white"
                  >
                    {inputTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Input Description</label>
                  <Input
                    name="inputDescription"
                    value={formData.inputDescription}
                    onChange={handleInputChange}
                    placeholder="e.g., The text to summarize, The image to analyze, The data to process"
                    className="bg-background/50 border-input/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Price per use (USD)</label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="bg-background/50 border-input/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to $0 for free agents, or charge per use (you keep 70% of earnings)
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={() => setStep(1)}
                  className="w-full bg-gradient-ai hover:bg-gradient-ai/90 text-white"
                  disabled={!formData.name || !formData.description}
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1: Webhook Configuration */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Step 2: Where is your agent?
                </CardTitle>
                <CardDescription>
                  Just paste your webhook URL - we'll handle the rest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Webhook URL *</label>
                  <Input
                    name="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-api.com/webhook"
                    className="bg-background/50 border-input/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is where we'll send user requests. Your agent should accept POST requests with JSON data.
                  </p>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">💡 We'll automatically generate:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete JSON schema for your agent</li>
                    <li>• Input validation rules</li>
                    <li>• Example inputs for testing</li>
                    <li>• Proper category classification</li>
                    <li>• All required metadata</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">🚀 Don't have a webhook yet?</h4>
                  <p className="text-sm text-blue-300 mb-3">
                    No problem! Create one quickly with:
                  </p>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• <strong>Python Flask/FastAPI</strong> - 5 minutes setup</li>
                    <li>• <strong>Node.js Express</strong> - Quick JavaScript solution</li>
                    <li>• <strong>Zapier/Make.com</strong> - No-code webhook</li>
                    <li>• <strong>Vercel Functions</strong> - Serverless endpoint</li>
                  </ul>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(0)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90 text-white"
                    disabled={!formData.webhookUrl}
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 3: Review & Submit
                </CardTitle>
                <CardDescription>
                  We've generated everything for you - just review and submit!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Agent Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Category:</strong> <Badge variant="secondary">{getCategoryFromDescription(formData.description)}</Badge></p>
                      <p><strong>Price:</strong> ${formData.price} per use</p>
                      <p><strong>Input Type:</strong> {inputTypes.find(t => t.value === formData.inputType)?.label}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Technical Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Webhook:</strong> {formData.webhookUrl}</p>
                      <p><strong>Status:</strong> <Badge variant="secondary">Ready to Deploy</Badge></p>
                      <p><strong>JSON Schema:</strong> <Badge variant="secondary">Auto-Generated</Badge></p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">✨ What we generated for you:</h4>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>• Complete JSON schema with proper validation</li>
                    <li>• Input type constraints and descriptions</li>
                    <li>• Example inputs for testing</li>
                    <li>• Automatic category classification</li>
                    <li>• All required metadata and versioning</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Generated JSON</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyJson}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadJson}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs text-muted-foreground bg-background/50 p-3 rounded overflow-x-auto max-h-40">
                    {generateJson()}
                  </pre>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
