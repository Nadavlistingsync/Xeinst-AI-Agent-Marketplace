"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeployPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    modelType: "",
    framework: "",
    requirements: "",
    apiEndpoint: "",
    environment: "production",
    version: "1.0.0",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'github'>("file");
  const [githubUrl, setGithubUrl] = useState("");

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

  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
  };

  const fetchGithubRepoAsZip = async (repoUrl: string): Promise<File> => {
    const match = repoUrl.match(/github.com\/(.+?)\/(.+?)(?:\.git)?(?:\/|$)/);
    if (!match) throw new Error("Invalid GitHub URL");
    const owner = match[1];
    const repo = match[2];
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    const response = await fetch(zipUrl);
    if (!response.ok) throw new Error("Failed to fetch GitHub repo ZIP");
    const blob = await response.blob();
    return new File([blob], `${repo}-main.zip`, { type: "application/zip" });
  };

  const validateDeployment = async () => {
    // Add validation logic here
    // For example, check if the file contains necessary configuration files
    // or if the model meets certain requirements
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDeploymentStatus("Starting deployment...");
    
    try {
      let fileName = "";
      let fileToUpload: File;

      if (uploadType === "file") {
        if (!file) throw new Error("Please select a file to upload");
        fileToUpload = file;
        fileName = `${Math.random()}-${file.name}`;
      } else {
        if (!githubUrl) throw new Error("Please enter a GitHub repository URL");
        fileToUpload = await fetchGithubRepoAsZip(githubUrl);
        fileName = `${Math.random()}.zip`;
      }

      setDeploymentStatus("Validating deployment package...");
      const isValid = await validateDeployment();
      if (!isValid) throw new Error("Invalid deployment package");

      setDeploymentStatus("Uploading files...");
      const filePath = `deployments/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("deployments")
        .upload(filePath, fileToUpload);
      
      if (uploadError) throw uploadError;

      setDeploymentStatus("Creating deployment record...");
      const { data: deployment, error: dbError } = await supabase
        .from("deployments")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            model_type: formData.modelType,
            framework: formData.framework,
            requirements: formData.requirements,
            api_endpoint: formData.apiEndpoint,
            environment: formData.environment,
            version: formData.version,
            file_url: filePath,
            status: "deploying",
            deployed_by: (await supabase.auth.getUser()).data.user?.id,
            source: uploadType === "github" ? githubUrl : "upload",
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setDeploymentStatus("Deployment successful!");
      router.push(`/deployments/${deployment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDeploymentStatus("Deployment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Deploy Your AI Agent</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {deploymentStatus && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded" role="status">
          {deploymentStatus}
        </div>
      )}

      <div className="flex mb-4 space-x-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadType === "file" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setUploadType("file")}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadType === "github" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setUploadType("github")}
        >
          Import from GitHub
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Agent Name
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
            <label htmlFor="modelType" className="block text-sm font-medium text-gray-700">
              Model Type
            </label>
            <input
              type="text"
              id="modelType"
              name="modelType"
              value={formData.modelType}
              onChange={handleInputChange}
              required
              placeholder="e.g., GPT-3, BERT, Custom"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
              Framework
            </label>
            <input
              type="text"
              id="framework"
              name="framework"
              value={formData.framework}
              onChange={handleInputChange}
              required
              placeholder="e.g., TensorFlow, PyTorch, Hugging Face"
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
              required
              placeholder="e.g., 1.0.0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            required
            rows={3}
            placeholder="List any specific requirements or dependencies"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">
            API Endpoint (Optional)
          </label>
          <input
            type="text"
            id="apiEndpoint"
            name="apiEndpoint"
            value={formData.apiEndpoint}
            onChange={handleInputChange}
            placeholder="e.g., /api/v1/predict"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

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
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        {uploadType === "file" ? (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Deployment Package
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
              GitHub Repository URL
            </label>
            <input
              type="text"
              id="githubUrl"
              value={githubUrl}
              onChange={handleGithubUrlChange}
              required
              placeholder="https://github.com/username/repository"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Deploying..." : "Deploy Agent"}
          </button>
        </div>
      </form>
    </div>
  );
} 