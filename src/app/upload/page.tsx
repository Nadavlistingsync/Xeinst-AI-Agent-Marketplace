"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import db from '@/lib/db';
import { products } from "@/lib/schema";
import { uploadFile } from '@/lib/file-helpers';
import { toast } from "react-hot-toast";

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    documentation: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'github'>("file");
  const [githubUrl, setGithubUrl] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!session?.user?.id) {
      setError("You must be logged in to upload a product");
      setLoading(false);
      return;
    }

    try {
      let uploadFile: File | null = null;

      if (uploadType === "file") {
        if (!file) throw new Error("Please select a file to upload");
        uploadFile = file;
      } else {
        if (!githubUrl) throw new Error("Please enter a GitHub repository URL");
        uploadFile = await fetchGithubRepoAsZip(githubUrl);
      }

      // Upload file
      const file_url = await uploadFile(uploadFile, session?.user?.id!);

      // Insert product into database
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const [product] = await db.insert(products).values({
        name: formData.name,
        slug,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        documentation: formData.documentation,
        file_url: file_url,
        uploaded_by: session.user.id,
        is_public: true,
      }).returning();

      toast.success('Product uploaded successfully!');
      router.push(`/product/${product.id}`);
    } catch (err) {
      console.error('Error uploading product:', err);
      toast.error('Failed to upload product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow" role="main">
      <h1 className="text-3xl font-bold mb-6">Upload Your AI Agent</h1>
      
      {error && (
        <div 
          className="mb-4 p-4 bg-red-100 text-red-700 rounded" 
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div 
        className="flex mb-4" 
        role="radiogroup" 
        aria-label="Upload type selection"
      >
        <button
          type="button"
          className={`mr-2 px-4 py-2 rounded ${uploadType === "file" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setUploadType("file")}
          aria-pressed={uploadType === "file"}
          aria-label="Upload file option"
        >
          Upload File
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadType === "github" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setUploadType("github")}
          aria-pressed={uploadType === "github"}
          aria-label="Import from GitHub option"
        >
          Import from GitHub
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="AI Agent upload form">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-required="true"
          />
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-required="true"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {uploadType === "file" ? (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full"
              aria-required="true"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
              GitHub Repository URL
            </label>
            <input
              type="url"
              id="githubUrl"
              value={githubUrl}
              onChange={handleGithubUrlChange}
              required
              placeholder="https://github.com/username/repo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-required="true"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
} 