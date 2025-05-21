"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    fetch("/api/list-products")
      .then(res => res.json())
      .then(data => {
        const found = (data.products || []).find((p: any) => p.id === id);
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      // TODO: Add payment check here
      const res = await fetch("/api/download-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, userId: "demo-user" }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setDownloadError(data.error || "Download failed");
      }
    } catch {
      setDownloadError("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!product) return <div className="text-center mt-20 text-red-600">Product not found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <div className="mb-2 text-gray-600">Category: {product.category}</div>
      <div className="mb-4">{product.description}</div>
      <div className="mb-4 font-bold">${product.price}</div>
      <div className="mb-4 text-gray-700 whitespace-pre-line">{product.documentation}</div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? "Processing..." : "Buy & Download"}
      </button>
      {downloadError && <div className="mt-4 text-red-600">{downloadError}</div>}
    </div>
  );
} 