"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Rocket,
  Copy,
  Download,
  Globe
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";

interface SuperSimpleAgentData {
  name: string;
  description: string;
  webhookUrl: string;
  price: string;
}

export default function SuperEasyUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [generatedJson, setGeneratedJson] = useState<string>("");
  
  const [formData, setFormData] = useState<SuperSimpleAgentData>({
    name: "",
    description: "",
    webhookUrl: "",
    price: "0"
  });

  const generateJson = () => {
    const category = getCategoryFromDescription(formData.description);
    const inputSchema = generateUniversalInputSchema();
    
    const agentJson = {
      name: formData.name,
      description: formData.description,
      category: category,
      price: parseFloat(formData.price),
      webhookUrl: formData.webhookUrl,
      version: "1.0.0",
      environment: "production",
      framework: "universal",
      modelType: "custom",
      inputSchema: inputSchema,
      exampleInputs: { input: "Sample input data" },
      documentation: `This agent ${formData.description.toLowerCase()}. Simply provide input and get instant results. Works with any webhook endpoint - Make.com, Zapier, custom APIs, or any other platform.`
    };

    return JSON.stringify(agentJson, null, 2);
  };

  const getCategoryFromDescription = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('text') || desc.includes('summar') || desc.includes('analyze') || desc.includes('write')) return "Text Analysis";
    if (desc.includes('image') || desc.includes('photo') || desc.includes('picture') || desc.includes('visual')) return "Image Processing";
    if (desc.includes('data') || desc.includes('csv') || desc.includes('process') || desc.includes('transform')) return "Data Processing";
    if (desc.includes('api') || desc.includes('webhook') || desc.includes('integrate') || desc.includes('connect')) return "API Integration";
    if (desc.includes('automate') || desc.includes('workflow') || desc.includes('trigger')) return "Automation";
    if (desc.includes('email') || desc.includes('message') || desc.includes('chat') || desc.includes('notify')) return "Communication";
    if (desc.includes('analytics') || desc.includes('report') || desc.includes('metrics') || desc.includes('track')) return "Analytics";
    return "Other";
  };

  const generateUniversalInputSchema = () => {
    return {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Input data for the agent"
        }
      },
      required: ["input"]
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setError("Please fill in all fields");
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
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Universal Compatibility</CardTitle>
                <CardDescription>Works with Make.com, Zapier, custom APIs, and more</CardDescription>
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
                  setSuccess(false);
                  setFormData({
                    name: "",
                    description: "",
                    webhookUrl: "",
                    price: "0"
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
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-4xl font-bold text-white mb-2">Upload Agent in 30 Seconds</h1>
          <p className="text-muted-foreground">Just 3 fields - we handle everything else automatically!</p>
        </motion.div>

        {/* Single Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Create Your AI Agent
              </CardTitle>
              <CardDescription>
                Works with Make.com, Zapier, custom APIs, or any webhook endpoint
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
                <label className="text-sm font-medium text-white">Webhook URL *</label>
                <Input
                  name="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="https://hook.eu1.make.com/abc123 or https://hooks.zapier.com/... or https://your-api.com/webhook"
                  className="bg-background/50 border-input/50"
                />
                <p className="text-xs text-muted-foreground">
                  Works with Make.com, Zapier, n8n, custom APIs, or any webhook endpoint
                </p>
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

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">✨ We automatically generate:</h4>
                <ul className="text-sm text-green-300 space-y-1">
                  <li>• Complete JSON schema with universal input format</li>
                  <li>• Smart category detection from your description</li>
                  <li>• Example inputs for testing</li>
                  <li>• All required metadata and versioning</li>
                  <li>• Universal compatibility documentation</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-ai hover:bg-gradient-ai/90 text-white py-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Create Agent & Upload to Marketplace
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated JSON Preview */}
        {generatedJson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated JSON</CardTitle>
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
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground bg-background/50 p-4 rounded overflow-x-auto max-h-60">
                  {generatedJson}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Platform Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Works with Any Platform</CardTitle>
              <CardDescription>Examples of webhook URLs from different platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Make.com</h4>
                  <code className="block p-2 bg-background/50 rounded text-xs">
                    https://hook.eu1.make.com/abc123def456
                  </code>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Zapier</h4>
                  <code className="block p-2 bg-background/50 rounded text-xs">
                    https://hooks.zapier.com/hooks/catch/123456/abc123/
                  </code>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">n8n</h4>
                  <code className="block p-2 bg-background/50 rounded text-xs">
                    https://your-n8n.com/webhook/abc123
                  </code>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Custom API</h4>
                  <code className="block p-2 bg-background/50 rounded text-xs">
                    https://your-api.com/webhook
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
