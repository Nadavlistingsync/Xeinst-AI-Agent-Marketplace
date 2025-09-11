"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
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
  Globe,
  DollarSign,
  Tag,
  Info
} from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowInput } from "@/components/ui/GlowInput";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";

interface AgentData {
  name: string;
  description: string;
  category: string;
  price: string;
  webhookUrl: string;
  webhookSecret: string;
  documentation: string;
  version: string;
  environment: string;
  framework: string;
  modelType: string;
  inputSchema: string;
  exampleInputs: string;
  tags: string[];
  earningsSplit: number;
  isPublic: boolean;
  requiresApproval: boolean;
}

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState<AgentData>({
    name: "",
    description: "",
    category: "",
    price: "",
    webhookUrl: "",
    webhookSecret: "",
    documentation: "",
    version: "1.0.0",
    environment: "production",
    framework: "webhook",
    modelType: "custom",
    inputSchema: "",
    exampleInputs: "",
    tags: [],
    earningsSplit: 0.8,
    isPublic: true,
    requiresApproval: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "automation",
    "content",
    "data",
    "development",
    "marketing",
    "productivity",
    "research",
    "social",
    "other"
  ];

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Webhook Config", icon: Webhook },
    { id: 3, title: "Input Schema", icon: Code },
    { id: 4, title: "Pricing & Settings", icon: DollarSign },
    { id: 5, title: "Review & Submit", icon: CheckCircle }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!agentData.name.trim()) newErrors.name = "Agent name is required";
        if (!agentData.description.trim()) newErrors.description = "Description is required";
        if (!agentData.category) newErrors.category = "Category is required";
        break;
      case 2:
        if (!agentData.webhookUrl.trim()) newErrors.webhookUrl = "Webhook URL is required";
        try {
          new URL(agentData.webhookUrl);
        } catch {
          newErrors.webhookUrl = "Please enter a valid URL";
        }
        break;
      case 3:
        if (!agentData.inputSchema.trim()) newErrors.inputSchema = "Input schema is required";
        try {
          JSON.parse(agentData.inputSchema);
        } catch {
          newErrors.inputSchema = "Please enter valid JSON";
        }
        break;
      case 4:
        if (!agentData.price.trim()) newErrors.price = "Price is required";
        const price = parseFloat(agentData.price);
        if (isNaN(price) || price < 1 || price > 1000) {
          newErrors.price = "Price must be between 1 and 1000 credits";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/agents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...agentData,
          price: parseFloat(agentData.price),
          inputSchema: JSON.parse(agentData.inputSchema),
          exampleInputs: agentData.exampleInputs ? JSON.parse(agentData.exampleInputs) : [],
          tags: agentData.tags.filter(tag => tag.trim())
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload agent');
      }

      const result = await response.json();
      router.push(`/dashboard?success=agent_uploaded&id=${result.agent.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const updateAgentData = (field: keyof AgentData, value: any) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !agentData.tags.includes(tag.trim()) && agentData.tags.length < 10) {
      updateAgentData('tags', [...agentData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateAgentData('tags', agentData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Upload AI Agent"
        subtitle="Connect your AI agent to the marketplace and start earning credits"
      />

      <Section>
      <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <GlassCard className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id 
                      ? 'border-accent bg-accent text-black' 
                      : 'border-white/20 text-white/50'
                  }`}>
                    <step.icon className="h-5 w-5" />
              </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-white/50'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-accent' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Form Content */}
          <GlassCard className="p-8">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-6">Basic Information</h3>
                
                <GlowInput
                  label="Agent Name"
                  placeholder="Enter your agent name"
                  value={agentData.name}
                  onChange={(e) => updateAgentData('name', e.target.value)}
                  error={!!errors.name}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Description</label>
                  <textarea
                    placeholder="Describe what your agent does..."
                    value={agentData.description}
                    onChange={(e) => updateAgentData('description', e.target.value)}
                    className="w-full h-24 px-3 py-2 rounded-xl border border-glass bg-white/5 text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-400">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Category</label>
                  <select
                    value={agentData.category}
                    onChange={(e) => updateAgentData('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass bg-white/5 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200"
                  >
                    <option value="" className="bg-black text-white">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-black text-white">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-400">{errors.category}</p>
                  )}
              </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {agentData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/20 text-accent"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-glass bg-white/5 text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-6">Webhook Configuration</h3>
                
                <GlowInput
                  label="Webhook URL"
                  placeholder="https://your-domain.com/webhook"
                  value={agentData.webhookUrl}
                  onChange={(e) => updateAgentData('webhookUrl', e.target.value)}
                  error={!!errors.webhookUrl}
                  helperText="The URL where your agent will receive webhook calls"
                />

                <GlowInput
                  label="Webhook Secret (optional)"
                  placeholder="Your webhook secret for authentication"
                  value={agentData.webhookSecret}
                  onChange={(e) => updateAgentData('webhookSecret', e.target.value)}
                  type="password"
                  helperText="Optional secret for webhook authentication"
                />

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-medium mb-1">Webhook Format</p>
                      <p>Your webhook will receive POST requests with this structure:</p>
                      <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">
{`{
  "event": "user_input",
  "executionId": "uuid",
  "agent": { "id": "...", "name": "..." },
  "user": { "id": "...", "email": "..." },
  "data": { /* user input */ },
  "callbackUrl": "https://xeinst.com/api/webhooks/agent-response"
}`}
                      </pre>
              </div>
                </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-6">Input Schema</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">JSON Schema</label>
                  <textarea
                    placeholder='{"type": "object", "properties": {"input": {"type": "string"}}, "required": ["input"]}'
                    value={agentData.inputSchema}
                    onChange={(e) => updateAgentData('inputSchema', e.target.value)}
                    className="w-full h-32 px-3 py-2 rounded-xl border border-glass bg-white/5 text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none"
                  />
                  {errors.inputSchema && (
                    <p className="text-sm text-red-400">{errors.inputSchema}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Example Inputs (optional)</label>
                  <textarea
                    placeholder='[{"input": "Hello world"}, {"input": "Another example"}]'
                    value={agentData.exampleInputs}
                    onChange={(e) => updateAgentData('exampleInputs', e.target.value)}
                    className="w-full h-24 px-3 py-2 rounded-xl border border-glass bg-white/5 text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 font-mono text-sm resize-none"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-6">Pricing & Settings</h3>
                
                <GlowInput
                  label="Price per Use (credits)"
                  placeholder="10"
                  value={agentData.price}
                  onChange={(e) => updateAgentData('price', e.target.value)}
                  error={!!errors.price}
                  helperText="Price between 1-1000 credits per use"
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Earnings Split</h4>
                      <p className="text-sm text-white/70">You get {(agentData.earningsSplit * 100).toFixed(0)}% of each credit</p>
              </div>
                    <div className="text-lg font-semibold text-accent">
                      {(agentData.earningsSplit * 100).toFixed(0)}%
              </div>
              </div>
                      <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={agentData.earningsSplit}
                    onChange={(e) => updateAgentData('earningsSplit', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Public Agent</h4>
                      <p className="text-sm text-white/70">Make your agent visible in the marketplace</p>
                </div>
                    <button
                      onClick={() => updateAgentData('isPublic', !agentData.isPublic)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        agentData.isPublic ? 'bg-accent' : 'bg-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        agentData.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
              </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Require Approval</h4>
                      <p className="text-sm text-white/70">Agent needs approval before going live</p>
              </div>
                    <button
                      onClick={() => updateAgentData('requiresApproval', !agentData.requiresApproval)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        agentData.requiresApproval ? 'bg-accent' : 'bg-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        agentData.requiresApproval ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-6">Review & Submit</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Agent Details</h4>
                      <div className="space-y-1 text-sm text-white/70">
                        <p><strong>Name:</strong> {agentData.name}</p>
                        <p><strong>Category:</strong> {agentData.category}</p>
                        <p><strong>Price:</strong> {agentData.price} credits</p>
                        <p><strong>Earnings:</strong> {(agentData.earningsSplit * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div>
                      <h4 className="font-medium text-white mb-2">Settings</h4>
                      <div className="space-y-1 text-sm text-white/70">
                        <p><strong>Public:</strong> {agentData.isPublic ? 'Yes' : 'No'}</p>
                        <p><strong>Approval:</strong> {agentData.requiresApproval ? 'Required' : 'Auto-approve'}</p>
                        <p><strong>Tags:</strong> {agentData.tags.length}</p>
                  </div>
                </div>
              </div>

              <div>
                    <h4 className="font-medium text-white mb-2">Description</h4>
                    <p className="text-sm text-white/70">{agentData.description}</p>
              </div>
                </div>

                {errors.submit && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400">{errors.submit}</p>
              </div>
                )}
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <GlowButton
                variant="glass"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                  Previous
              </GlowButton>

              <div className="flex items-center space-x-4">
                {currentStep < 5 ? (
                  <GlowButton onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </GlowButton>
                ) : (
                  <GlowButton onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Uploading...
                    </>
                  ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Agent
                    </>
                  )}
                  </GlowButton>
                )}
              </div>
            </div>
          </GlassCard>
      </div>
      </Section>
    </div>
  );
} 