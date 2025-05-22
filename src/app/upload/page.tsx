"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadPage() {
  const router = useRouter();
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
    // Parse the repo URL
    const match = repoUrl.match(/github.com\/(.+?)\/(.+?)(?:\.git)?(?:\/|$)/);
    if (!match) throw new Error("Invalid GitHub URL");
    const owner = match[1];
    const repo = match[2];
    // Default branch is main
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
    let uploadFile: File | null = null;
    let fileName = "";
    try {
      if (uploadType === "file") {
        if (!file) throw new Error("Please select a file to upload");
        uploadFile = file;
        const fileExt = file.name.split(".").pop();
        fileName = `${Math.random()}.${fileExt}`;
      } else {
        if (!githubUrl) throw new Error("Please enter a GitHub repository URL");
        uploadFile = await fetchGithubRepoAsZip(githubUrl);
        fileName = `${Math.random()}.zip`;
      }
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, uploadFile);
      if (uploadError) throw uploadError;
      const { data: product, error: dbError } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            price: parseFloat(formData.price),
            documentation: formData.documentation,
            file_url: filePath,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
            is_public: true,
            status: "pending",
            source: uploadType === "github" ? githubUrl : "upload",
          },
        ])
        .select()
        .single();
      if (dbError) throw dbError;
      router.push(`/product/${product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Upload Your AI Agent</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex mb-4">
        <button
          type="button"
          className={`mr-2 px-4 py-2 rounded ${uploadType === "file" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Documentation (Markdown)</label>
          <textarea
            name="documentation"
            value={formData.documentation}
            onChange={handleInputChange}
            required
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {uploadType === "file" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              onChange={handleFileChange}
              required={uploadType === "file"}
              className="mt-1 block w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub Repository URL</label>
            <input
              type="text"
              value={githubUrl}
              onChange={handleGithubUrlChange}
              required={uploadType === "github"}
              placeholder="https://github.com/owner/repo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? (uploadType === "file" ? "Uploading..." : "Importing from GitHub...") : (uploadType === "file" ? "Upload Product" : "Import Product")}
        </button>
      </form>
    </div>
  );
} 