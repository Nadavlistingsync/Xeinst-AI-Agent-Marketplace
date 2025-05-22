"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
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
  status: string;
  environment: string;
  version: string;
  created_at: string;
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const { data, error } = await supabase
        .from("deployments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeployments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deployments");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Deployments</h1>
        <Link
          href="/deploy"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Deploy New Agent
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {deployments.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No deployments yet</h3>
          <p className="mt-2 text-gray-500">
            Get started by deploying your first AI agent.
          </p>
          <div className="mt-6">
            <Link
              href="/deploy"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Deploy New Agent
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {deployments.map((deployment) => (
              <li key={deployment.id}>
                <Link
                  href={`/deployments/${deployment.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {deployment.name}
                        </p>
                        <div
                          className={`ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            deployment.status
                          )}`}
                        >
                          {deployment.status}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {deployment.environment}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {deployment.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date(deployment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <p className="mr-4">
                        <span className="font-medium">Model:</span>{" "}
                        {deployment.model_type}
                      </p>
                      <p className="mr-4">
                        <span className="font-medium">Framework:</span>{" "}
                        {deployment.framework}
                      </p>
                      <p>
                        <span className="font-medium">Version:</span>{" "}
                        {deployment.version}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 