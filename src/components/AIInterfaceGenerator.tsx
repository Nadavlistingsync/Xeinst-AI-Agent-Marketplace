"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AIGenerationOptions } from '@/lib/ai-interface-generator';

interface AIInterfaceGeneratorProps {
  agentId: string;
  onInterfaceGenerated?: (interfaceData: any) => void;
}

export default function AIInterfaceGenerator({ 
  agentId, 
  onInterfaceGenerated 
}: AIInterfaceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInterface, setGeneratedInterface] = useState<any>(null);
  const [options, setOptions] = useState<AIGenerationOptions>({
    theme: 'modern',
    layout: 'single-column',
    features: ['preview'],
    complexity: 'standard'
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/agents/${agentId}/generate-interface`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interface');
      }

      const data = await response.json();
      setGeneratedInterface(data.interface);
      onInterfaceGenerated?.(data.interface);
      toast.success('AI Interface generated successfully!');
    } catch (error) {
      console.error('Error generating interface:', error);
      toast.error('Failed to generate interface');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (key: keyof AIGenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setOptions(prev => ({
      ...prev,
      features: prev.features?.includes(feature as any)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature as any]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🤖 AI Interface Generator
        </h3>
        <p className="text-gray-600">
          Automatically generate a professional user interface for your agent based on its schema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={options.theme}
            onChange={(e) => handleOptionChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <select
            value={options.layout}
            onChange={(e) => handleOptionChange('layout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single-column">Single Column</option>
            <option value="two-column">Two Column</option>
            <option value="grid">Grid</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        {/* Complexity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complexity
          </label>
          <select
            value={options.complexity}
            onChange={(e) => handleOptionChange('complexity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="simple">Simple</option>
            <option value="standard">Standard</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Features Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="space-y-2">
            {['preview', 'charts', 'real-time', 'file-upload', 'history'].map((feature) => (
              <label key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.features?.includes(feature as any)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {feature.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Interface...
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              Generate AI Interface
            </div>
          )}
        </button>
      </div>

      {/* Generated Interface Preview */}
      {generatedInterface && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            ✨ Generated Interface Preview
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Interface Details</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Theme:</strong> {generatedInterface.metadata.theme}</p>
                <p><strong>Layout:</strong> {generatedInterface.layout}</p>
                <p><strong>Responsive:</strong> {generatedInterface.metadata.responsive ? 'Yes' : 'No'}</p>
                <p><strong>Accessibility:</strong> {generatedInterface.metadata.accessibility ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Components</h5>
              <div className="text-sm text-gray-600">
                <p><strong>Total Components:</strong> {generatedInterface.components.length}</p>
                <p><strong>Input Fields:</strong> {generatedInterface.components.filter((c: any) => c.type === 'input').length}</p>
                <p><strong>Action Buttons:</strong> {generatedInterface.components.filter((c: any) => c.type === 'button').length}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedInterface.reactCode);
                toast.success('React code copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              📋 Copy React Code
            </button>
            
            <button
              onClick={() => {
                const blob = new Blob([generatedInterface.reactCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${generatedInterface.metadata.title.replace(/\s+/g, '_')}.tsx`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('React component downloaded!');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              💾 Download Component
            </button>
          </div>
        </div>
      )}

      {/* Features Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          🎯 What the AI Interface Generator Does:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Analyzes your agent's JSON schema to create appropriate form fields</li>
          <li>• Generates responsive, accessible UI components</li>
          <li>• Creates professional styling with multiple theme options</li>
          <li>• Produces ready-to-use React/Next.js component code</li>
          <li>• Includes validation rules based on your schema</li>
          <li>• Optimizes for different screen sizes and devices</li>
        </ul>
      </div>
    </div>
  );
} 