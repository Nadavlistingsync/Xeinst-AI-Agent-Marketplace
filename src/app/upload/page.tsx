"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AIInterfaceGenerator from "@/components/AIInterfaceGenerator";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedAgentId, setUploadedAgentId] = useState<string | null>(null);
  const [showInterfaceGenerator, setShowInterfaceGenerator] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "0",
    documentation: "",
    apiUrl: "",
    version: "1.0.0",
    environment: "production",
    framework: "custom",
    modelType: "custom",
  });
  const [inputSchema, setInputSchema] = useState(`{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Input for the agent"
    }
  },
  "required": ["input"]
}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate JSON schema
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(inputSchema);
      } catch (err) {
        throw new Error('Invalid JSON schema format');
      }

      const agentData = {
        ...formData,
        price: parseFloat(formData.price),
        inputSchema: parsedSchema,
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

  const handleInterfaceGenerated = (interfaceData: any) => {
    toast.success('AI Interface generated! Your agent is now ready for the marketplace.');
    // Optionally redirect to marketplace or agent details
    setTimeout(() => {
      router.push('/marketplace');
    }, 2000);
  };

  if (showInterfaceGenerator && uploadedAgentId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Agent Uploaded Successfully!
            </h1>
            <p className="text-gray-600">
              Now let's create a beautiful AI-powered interface for your agent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Interface Generator */}
            <div className="lg:col-span-2">
              <AIInterfaceGenerator 
                agentId={uploadedAgentId} 
                onInterfaceGenerated={handleInterfaceGenerated}
              />
            </div>

            {/* Sidebar with next steps */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 Next Steps
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Agent Uploaded</p>
                      <p>Your agent is now in the marketplace</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Generate Interface</p>
                      <p>Create a professional UI for your agent</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Deploy & Share</p>
                      <p>Your agent will be live in the marketplace</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Choose a theme that matches your brand</li>
                  <li>• Test different layouts for best UX</li>
                  <li>• Enable features your users will need</li>
                  <li>• Download the React code for customization</li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/marketplace')}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Skip & Go to Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload New Agent to Marketplace</h1>
          <p className="text-gray-400">
            Upload your AI agent and get a professional interface automatically generated for you.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Agent Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Text Summarizer"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-200">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Text Processing"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe what your agent does..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-200">
                Price (credits per run)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-200">
                API URL *
              </label>
              <input
                type="url"
                id="apiUrl"
                name="apiUrl"
                value={formData.apiUrl}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://api.example.com/your-agent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-200">
                Version
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="framework" className="block text-sm font-medium text-gray-200">
                Framework
              </label>
              <input
                type="text"
                id="framework"
                name="framework"
                value={formData.framework}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="modelType" className="block text-sm font-medium text-gray-200">
                Model Type
              </label>
              <input
                type="text"
                id="modelType"
                name="modelType"
                value={formData.modelType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="documentation" className="block text-sm font-medium text-gray-200">
              Documentation
            </label>
            <textarea
              id="documentation"
              name="documentation"
              value={formData.documentation}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Provide usage instructions, examples, and any important notes..."
            />
          </div>

          <div>
            <label htmlFor="inputSchema" className="block text-sm font-medium text-gray-200">
              Input JSON Schema *
            </label>
            <textarea
              id="inputSchema"
              value={inputSchema}
              onChange={(e) => setInputSchema(e.target.value)}
              required
              rows={8}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              placeholder="Define the JSON schema for your agent's input..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Define the structure and validation rules for the input your agent expects. This will be used to generate your AI interface.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/marketplace')}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Agent & Generate Interface'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 