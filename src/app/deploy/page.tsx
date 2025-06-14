"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function DeployPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modelType: "",
    framework: "",
    requirements: "",
    apiEndpoint: "",
    environment: "production",
    version: "1.0.0",
    price: "0.00",
    accessLevel: "",
    licenseType: "",
    source: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'zip' | 'github'>('zip');
  const [githubUrl, setGithubUrl] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      let response;
      if (uploadMethod === 'zip') {
        if (!file) {
          throw new Error('Please upload a .zip file for your agent.');
        }
        const form = new FormData();
        form.append('file', file);
        form.append('name', formData.name);
        form.append('description', formData.description);
        form.append('framework', formData.framework);
        form.append('modelType', formData.modelType);
        form.append('environment', formData.environment);
        form.append('source', formData.source);
        response = await fetch('/api/upload-agent', {
          method: 'POST',
          body: form,
        });
      } else if (uploadMethod === 'github') {
        if (!githubUrl) {
          throw new Error('Please provide a GitHub repository URL.');
        }
        response = await fetch('/api/upload-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUrl,
            name: formData.name,
            description: formData.description,
            framework: formData.framework,
            modelType: formData.modelType,
            environment: formData.environment,
            source: formData.source,
          }),
        });
      }

      if (!response || !response.ok) {
        const errorText = await response?.text();
        throw new Error(errorText || 'Failed to upload agent');
      }

      toast.success('Agent uploaded and deployed successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error uploading agent:', error);
      toast.error(error.message || 'Failed to upload agent');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12 px-4">
      <div className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg tracking-tight">Deploy Your AI Agent</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Agent Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
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
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                required
              />
            </div>
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-200">
                Requirements (comma-separated)
              </label>
              <input
                type="text"
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. python, tensorflow, numpy"
              />
            </div>
          </div>
          <div className="mb-6 flex gap-4">
            <button type="button" onClick={() => setUploadMethod('zip')} className={`px-4 py-2 rounded-md ${uploadMethod === 'zip' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Upload ZIP</button>
            <button type="button" onClick={() => setUploadMethod('github')} className={`px-4 py-2 rounded-md ${uploadMethod === 'github' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>GitHub Link</button>
          </div>
          {uploadMethod === 'zip' && (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-200">
                Agent Folder (Upload as .zip file)
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".zip"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={uploadMethod === 'zip'}
              />
              <p className="text-xs text-gray-400 mt-1">Please compress your agent folder into a .zip file and upload it here.</p>
            </div>
          )}
          {uploadMethod === 'github' && (
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-200">
                GitHub Repository URL
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://github.com/username/repo"
                required={uploadMethod === 'github'}
              />
              <p className="text-xs text-gray-400 mt-1">Paste the public GitHub repository URL for your agent.</p>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isUploading ? 'Deploying...' : 'Deploy Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 