"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui';
import { GlassCard } from './ui/GlassCard';
import { toast } from 'react-hot-toast';
import { Agent } from '../types/agent';

interface EditAgentFormProps {
  agent: Agent;
  onSuccess?: () => void;
}

const EditAgentForm: React.FC<EditAgentFormProps> = ({ agent, onSuccess }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent.name || '',
    description: agent.description || '',
    category: agent.category || 'automation',
    price: agent.price || 5,
    instructions: agent.instructions || '',
    isPublic: agent.isPublic || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update agent');
      }

      toast.success('Agent updated successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/agent/${agent.id}`);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update agent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <GlassCard className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Agent Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter agent name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            placeholder="Describe what your agent does"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="automation">Automation</option>
            <option value="data-analysis">Data Analysis</option>
            <option value="content-creation">Content Creation</option>
            <option value="customer-service">Customer Service</option>
            <option value="productivity">Productivity</option>
            <option value="marketing">Marketing</option>
            <option value="development">Development</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
            Price (Credits)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="1"
            max="1000"
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="5"
          />
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-white mb-2">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            placeholder="Detailed instructions for your agent..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="rounded border-white/20 bg-white/10 text-accent focus:ring-2 focus:ring-accent"
          />
          <label htmlFor="isPublic" className="text-sm text-white">
            Make this agent public in the marketplace
          </label>
        </div>

        <div className="flex space-x-4 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Agent'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};

export default EditAgentForm;
