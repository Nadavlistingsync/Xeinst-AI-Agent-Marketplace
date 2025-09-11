import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Define Agent type locally since it's not available
interface Agent {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  documentation?: string;
  fileUrl?: string;
  version?: string;
  environment?: string;
  framework?: string;
  modelType?: string;
  isPublic?: boolean;
}

interface EditAgentFormProps {
  agent: Agent;
  onSuccess?: () => void;
}

export default function EditAgentForm({ agent, onSuccess }: EditAgentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent.name || '',
    description: agent.description || '',
    category: agent.category || '',
    price: agent.price || 0,
    documentation: agent.documentation || '',
    fileUrl: agent.fileUrl || '',
    version: agent.version || '1.0.0',
    environment: agent.environment || 'production',
    framework: agent.framework || 'custom',
    modelType: agent.modelType || 'custom',
    isPublic: agent.isPublic ?? true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update agent');
      }

      toast.success('Agent updated successfully');
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete agent');
      }

      toast.success('Agent deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            placeholder="e.g., Productivity, AI Assistant, Data Analysis"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          placeholder="Brief description of what your agent does"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (USD)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="text"
            id="version"
            name="version"
            value={formData.version}
            onChange={handleInputChange}
            placeholder="1.0.0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
            Environment
          </label>
          <select
            id="environment"
            name="environment"
            value={formData.environment}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="production">Production</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
          </select>
        </div>

        <div>
          <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
            Framework
          </label>
          <select
            id="framework"
            name="framework"
            value={formData.framework}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="custom">Custom</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="langchain">LangChain</option>
            <option value="autogen">AutoGen</option>
          </select>
        </div>

        <div>
          <label htmlFor="modelType" className="block text-sm font-medium text-gray-700">
            Model Type
          </label>
          <select
            id="modelType"
            name="modelType"
            value={formData.modelType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="custom">Custom</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
            <option value="claude-2">Claude 2</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">
          File URL *
        </label>
        <input
          type="url"
          id="fileUrl"
          name="fileUrl"
          value={formData.fileUrl}
          onChange={handleInputChange}
          required
          placeholder="https://example.com/agent-file.json"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="documentation" className="block text-sm font-medium text-gray-700">
          Documentation
        </label>
        <textarea
          id="documentation"
          name="documentation"
          value={formData.documentation}
          onChange={handleInputChange}
          rows={6}
          placeholder="Detailed documentation about your agent, including usage instructions, API endpoints, and examples..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
          Make this agent public in the marketplace
        </label>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Agent'}
        </button>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Agent'}
          </button>
        </div>
      </div>
    </form>
  );
} 