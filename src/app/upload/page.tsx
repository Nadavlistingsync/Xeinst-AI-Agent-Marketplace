'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function UploadAgent() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tag: '',
    price: '',
    documentation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Your AI Agent</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Gym">Gym</option>
                  <option value="Ecommerce">Ecommerce</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="documentation" className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation
                </label>
                <textarea
                  id="documentation"
                  value={formData.documentation}
                  onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed documentation about your agent..."
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Agent
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 