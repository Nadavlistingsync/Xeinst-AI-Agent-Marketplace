"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import JSZip from "jszip";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { uploadToS3 } from "@/lib/s3-helpers";
import { createDeployment } from "@/lib/db-helpers";

export default function DeployPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
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
  });

  const [file, setFile] = useState<File | null>(null);
  const [folderFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'github'>("file");
  const [githubUrl, setGithubUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).webkitdirectory = true;
      (fileInputRef.current as HTMLInputElement).directory = true;
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGithubUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGithubUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setDeploymentStatus("Starting deployment...");
    setUploadProgress(0);
    setIsUploading(true);
    
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
      const filePath = `uploads/${session?.user?.id}/${Date.now()}-${fileName}`;
      
      const uploadResult = await uploadToS3(filePath, fileToUpload);

      setDeploymentStatus("Creating deployment record...");
      
      const deployment = await createDeployment({
        name: fileName,
        description: "Deployed via web interface",
        framework: "custom",
        file_url: uploadResult,
        deployed_by: session?.user?.id!,
        model_type: "custom",
        version: "1.0.0",
        source: "web",
      });

      if (!deployment) {
        throw new Error("Failed to create deployment record");
      }

      toast.success("Deployment created successfully!");
      router.push(`/deployments/${deployment.id}`);
    } catch (err) {
      console.error("Deployment error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during deployment");
      toast.error("Deployment failed");
    } finally {
      setIsUploading(false);
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

  const handleFileUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      const filePath = `agents/${session?.user?.id}/${Date.now()}-${file.name}`;
      await uploadToS3(filePath, file);
      setUploadProgress(100);
      setFormData(prev => ({ ...prev, filePath }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
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
                    className="bg-blue-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
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
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-200">
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your requirements.txt content here"
            />
          </div>
          <div>
            <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-200">
              API Endpoint
            </label>
            <input
              type="text"
              id="apiEndpoint"
              name="apiEndpoint"
              value={formData.apiEndpoint}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-200">
                Environment
              </label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-200">
                Price (USD)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-4">
              Upload Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={`px-4 py-2 rounded-md ${
                  uploadType === "file"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadType("github")}
                className={`px-4 py-2 rounded-md ${
                  uploadType === "github"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                GitHub Repository
              </button>
            </div>
          </div>
          {uploadType === "file" ? (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Upload File or Folder
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-200">
                GitHub Repository URL
              </label>
              <input
                type="text"
                id="githubUrl"
                value={githubUrl}
                onChange={handleGithubUrlChange}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://github.com/username/repo"
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className={`px-6 py-3 rounded-md text-white font-semibold ${
                isUploading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Deploying..." : "Deploy Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 