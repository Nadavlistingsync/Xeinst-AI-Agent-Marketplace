'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function UploadAgent() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    documentation: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('documentation', formData.documentation);
      if (file) data.append('file', file);
      // TODO: Add uploader_id from auth if available
      data.append('uploader_id', 'demo-uploader');

      const res = await fetch('/api/upload-product', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.product) {
        setStatus('success');
        setFormData({ name: '', description: '', category: '', price: '', documentation: '' });
        setFile(null);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight border-b-4 border-blue-500 inline-block pb-2">
            Upload Your Software
          </h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8" encType="multipart/form-data">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Provide detailed documentation about your software..."
                  required
                />
              </div>
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div className="pt-4">
                {status === 'success' && (
                  <div className="mt-4 text-green-600 font-semibold">Software uploaded successfully!</div>
                )}
                {status === 'error' && (
                  <div className="mt-4 text-red-600 font-semibold">Failed to upload software. Please try again.</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                  disabled={loading}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {loading ? 'Uploading...' : 'Upload Software'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 