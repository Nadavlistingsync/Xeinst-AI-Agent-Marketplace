"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Deployment {
  id: string;
  name: string;
  description: string;
  model_type: string;
  framework: string;
  requirements: string;
  api_endpoint: string;
  environment: string;
  version: string;
  status: string;
  file_url: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function DeploymentDetailsPage() {
  const params = useParams();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const fetchDeployment = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("deployments")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setDeployment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deployment");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchLogs = useCallback(async () => {
    // Replace with actual log fetching logic
    const mockLogs = [
      `[${new Date().toISOString()}] Deployment in progress...`,
      `[${new Date().toISOString()}] Initializing environment...`,
      `[${new Date().toISOString()}] Installing dependencies...`,
    ];
    setLogs((prev) => [...prev, ...mockLogs]);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchDeployment();
      // Simulate real-time logs (replace with actual log fetching)
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [params.id, fetchDeployment, fetchLogs]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "deploying":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Deployment not found</h3>
          <p className="mt-2 text-gray-500">
            The deployment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <div className="mt-6">
            <Link
              href="/deployments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Deployments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/deployments"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Deployments
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{deployment.name}</h1>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              deployment.status
            )}`}
          >
            {deployment.status}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Deployment Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Model Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.model_type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Framework</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.framework}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Environment</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.environment}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">API Endpoint</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {deployment.api_endpoint || "Not configured"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="mt-1 text-sm text-gray-900">{deployment.source}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(deployment.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(deployment.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Deployment Logs</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 font-mono">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Requirements</h2>
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-gray-900">{deployment.requirements}</code>
        </pre>
      </div>
    </div>
  );
} 