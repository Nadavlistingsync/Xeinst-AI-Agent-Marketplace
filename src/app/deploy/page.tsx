"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeployPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<{
    name: string;
    description: string;
    modelType: string;
    framework: string;
    readme?: string;
  } | null>(null);
  
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
  });

  const [file, setFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'github'>("file");
  const [githubUrl, setGithubUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).webkitdirectory = true;
      (fileInputRef.current as any).directory = true;
    }
  }, [uploadType]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Agent name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.modelType.trim()) {
      toast.error("Model type is required");
      return false;
    }
    if (!formData.framework.trim()) {
      toast.error("Framework is required");
      return false;
    }
    if (uploadType === "file" && !file && !folderFiles) {
      toast.error("Please select a file or folder to upload");
      return false;
    }
    if (uploadType === "github" && !githubUrl) {
      toast.error("Please enter a GitHub repository URL");
      return false;
    }
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    updatePreview();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const totalSize = Array.from(e.target.files).reduce((acc, file) => acc + file.size, 0);
      
      if (totalSize > MAX_FILE_SIZE) {
        toast.error(`Total size exceeds 50MB limit`);
        return;
      }

      if (e.target.webkitdirectory) {
        setFolderFiles(e.target.files);
        setFile(null);
      } else {
        setFile(e.target.files[0]);
        setFolderFiles(null);
      }
      updatePreview();
    }
  };

  const handleGithubUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGithubUrl(url);
    
    if (url) {
      try {
        const match = url.match(/github.com\/(.+?)\/(.+?)(?:\.git)?(?:\/|$)/);
        if (match) {
          const [_, owner, repo] = match;
          const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
          const response = await fetch(readmeUrl);
          if (response.ok) {
            const readme = await response.text();
            setPreview(prev => ({ ...prev!, readme }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch README:", error);
      }
    }
  };

  const updatePreview = () => {
    setPreview({
      name: formData.name,
      description: formData.description,
      modelType: formData.modelType,
      framework: formData.framework,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setDeploymentStatus("Starting deployment...");
    setUploadProgress(0);
    
    try {
      let fileName = "";
      let fileToUpload: File;

      if (uploadType === "file") {
        if (folderFiles) {
          setDeploymentStatus("Compressing folder...");
          fileToUpload = await zipFolderFiles(folderFiles);
          fileName = `${Math.random()}-${fileToUpload.name}`;
        } else if (file) {
          fileToUpload = file;
          fileName = `${Math.random()}-${file.name}`;
        } else {
          throw new Error("Please select a file or folder to upload");
        }
      } else {
        if (!githubUrl) throw new Error("Please enter a GitHub repository URL");
        setDeploymentStatus("Fetching GitHub repository...");
        fileToUpload = await fetchGithubRepoAsZip(githubUrl);
        fileName = `${Math.random()}.zip`;
      }

      setDeploymentStatus("Uploading files...");
      const filePath = `deployments/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("deployments")
        .upload(filePath, fileToUpload, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });
      
      if (uploadError) throw uploadError;

      setDeploymentStatus("Creating deployment record...");
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data: deployment, error: dbError } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            slug,
            description: formData.description,
            model_type: formData.modelType,
            framework: formData.framework,
            requirements: formData.requirements,
            api_endpoint: formData.apiEndpoint,
            environment: formData.environment,
            version: formData.version,
            price: parseFloat(formData.price),
            file_url: filePath,
            status: "active",
            created_by: (await supabase.auth.getUser()).data.user?.id,
            source: uploadType === "github" ? githubUrl : "upload",
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Agent deployed successfully!");
      router.push(`/marketplace/${deployment.slug}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setDeploymentStatus("Deployment failed");
    } finally {
      setLoading(false);
    }
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

  const zipFolderFiles = async (files: FileList): Promise<File> => {
    const zip = new JSZip();
    Array.from(files).forEach((file) => {
      // file.webkitRelativePath preserves folder structure
      zip.file(file.webkitRelativePath, file);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    return new File([blob], `folder-upload-${Date.now()}.zip`, { type: "application/zip" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12 px-4">
      <div className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg tracking-tight">Deploy Your AI Agent</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-400/20 text-red-200 rounded-lg text-center font-semibold" role="alert">
            {error}
          </div>
        )}
        {deploymentStatus && (
          <div className="mb-4 p-4 bg-blue-400/20 text-blue-200 rounded-lg text-center font-semibold" role="status">
            {deploymentStatus}
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm">{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>
        )}
        <div className="flex mb-8 space-x-4 justify-center">
          <button
            type="button"
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${uploadType === "file" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            onClick={() => setUploadType("file")}
          >
            Upload File
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${uploadType === "github" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            onClick={() => setUploadType("github")}
          >
            Import from GitHub
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="name" className="block text-base font-semibold text-white mb-2">Agent Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="modelType" className="block text-base font-semibold text-white mb-2">Model Type</label>
              <input
                type="text"
                id="modelType"
                name="modelType"
                value={formData.modelType}
                onChange={handleInputChange}
                required
                placeholder="e.g., GPT-3, BERT, Custom"
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="framework" className="block text-base font-semibold text-white mb-2">Framework</label>
              <input
                type="text"
                id="framework"
                name="framework"
                value={formData.framework}
                onChange={handleInputChange}
                required
                placeholder="e.g., TensorFlow, PyTorch, Hugging Face"
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="version" className="block text-base font-semibold text-white mb-2">Version</label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                required
                placeholder="e.g., 1.0.0"
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-base font-semibold text-white mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="requirements" className="block text-base font-semibold text-white mb-2">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="List any specific requirements or dependencies"
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="apiEndpoint" className="block text-base font-semibold text-white mb-2">API Endpoint (Optional)</label>
              <input
                type="text"
                id="apiEndpoint"
                name="apiEndpoint"
                value={formData.apiEndpoint}
                onChange={handleInputChange}
                placeholder="e.g., /api/v1/predict"
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="environment" className="block text-base font-semibold text-white mb-2">Environment</label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
          {uploadType === "file" ? (
            <div>
              <label htmlFor="file" className="block text-base font-semibold text-white mb-2">Deployment Package (File or Folder)</label>
              <input
                type="file"
                id="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                required={!folderFiles && !file}
                className="mt-1 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                multiple
              />
              <p className="text-xs text-gray-300 mt-2">You can select a single file or an entire folder for upload.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="githubUrl" className="block text-base font-semibold text-white mb-2">GitHub Repository URL</label>
              <input
                type="text"
                id="githubUrl"
                value={githubUrl}
                onChange={handleGithubUrlChange}
                required
                placeholder="https://github.com/username/repository"
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-900/80 text-white px-4 py-3 shadow-inner focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          )}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${loading ? "bg-gray-500 text-gray-300" : "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500"}`}
            >
              {loading ? "Deploying..." : "Deploy Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 