"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Upload, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Globe, 
  Code, 
  Settings,
  Sparkles,
  Rocket,
  DollarSign,
  Users,
  Clock
} from "lucide-react";
import { Button } from "../../components/ui";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

interface AgentData {
  name: string;
  description: string;
  category: string;
  webhookUrl: string;
  price: string;
}

export default function SimpleUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AgentData>({
    name: "",
    description: "",
    category: "",
    webhookUrl: "",
    price: "0"
  });

  const categories = [
    "Text Analysis",
    "Image Processing", 
    "Data Processing",
    "API Integration",
    "Automation",
    "Communication",
    "Analytics",
    "Other"
  ];

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
      if (!formData.name || !formData.description || !formData.category || !formData.webhookUrl) {
        setError("Please fill in all required fields");
        return;
      }

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          version: "1.0.0",
          environment: "production",
          framework: "custom",
          modelType: "custom",
          inputSchema: JSON.stringify({
            type: "object",
            properties: {
              input: {
                type: "string",
                description: "Input for the agent"
              }
            },
            required: ["input"]
          }),
          exampleInputs: JSON.stringify({
            input: "Hello, this is a test input"
          }),
          inputTypes: ["text"],
          supportsStreaming: false,
          supportsEmailCallback: false
        })
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
              🎉 Agent Connected Successfully!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your AI agent is now live in the marketplace and ready to earn credits!
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Track Performance</CardTitle>
                <CardDescription>Monitor usage, earnings, and user feedback</CardDescription>
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
                    category: "",
                    webhookUrl: "",
                    price: "0"
                  });
                }}
              >
                Upload Another Agent
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
        {/* Welcome Message */}
        {isWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-ai rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Xeinst!</h1>
            <p className="text-muted-foreground">Let's get your first AI agent connected in just 3 simple steps</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/upload-easy')}
                className="text-accent border-accent hover:bg-accent hover:text-black"
              >
                🚀 Try Super Easy Mode (Auto-generates JSON)
              </Button>
            </div>
          </motion.div>
        )}

        {/* Progress Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Connect Your AI Agent
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
                <Progress value={progress} className="w-32" />
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
                  Step 1: Agent Information
                </CardTitle>
                <CardDescription>
                  Tell us about your AI agent so users can find and use it
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
                  <label className="text-sm font-medium text-white">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input/50 bg-background/50 rounded-md text-sm text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Description *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what your agent does and how it helps users..."
                    rows={4}
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
                  disabled={!formData.name || !formData.category || !formData.description}
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
                  Step 2: Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Connect your agent via webhook - this is where we'll send user requests
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
                  <h4 className="font-medium text-white mb-2">Expected Request Format:</h4>
                  <pre className="text-xs text-muted-foreground bg-background/50 p-3 rounded">
{`POST /your-webhook-url
Content-Type: application/json

{
  "input": "User input text here",
  "userId": "user123",
  "requestId": "req_123456"
}`}
                  </pre>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">💡 Don't have a webhook yet?</h4>
                  <p className="text-sm text-blue-300 mb-3">
                    No problem! You can create a simple webhook using:
                  </p>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• <strong>Python Flask/FastAPI</strong> - Quick setup for AI agents</li>
                    <li>• <strong>Node.js Express</strong> - Great for JavaScript developers</li>
                    <li>• <strong>Zapier/Make.com</strong> - No-code webhook solutions</li>
                    <li>• <strong>Vercel Functions</strong> - Serverless webhook endpoints</li>
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
                  <Settings className="h-5 w-5" />
                  Step 3: Review & Submit
                </CardTitle>
                <CardDescription>
                  Review your agent details and submit to the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Agent Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Category:</strong> {formData.category}</p>
                      <p><strong>Price:</strong> ${formData.price} per use</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Technical Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Webhook:</strong> {formData.webhookUrl}</p>
                      <p><strong>Status:</strong> <Badge variant="secondary">Ready to Deploy</Badge></p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">🚀 What happens next?</h4>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>• Your agent will be live in the marketplace within minutes</li>
                    <li>• Users can discover and use your agent immediately</li>
                    <li>• You'll earn credits every time someone uses it</li>
                    <li>• Track performance and earnings in your dashboard</li>
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
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Connect to Marketplace
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
