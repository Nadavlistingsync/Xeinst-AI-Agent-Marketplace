"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getDeployment } from "@/lib/db-helpers";
import Link from "next/link";

export default function DeploymentPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [deployment, setDeployment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        const data = await getDeployment(params.id);
        setDeployment(data);
      } catch (err) {
        setError("Failed to load deployment");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployment();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!deployment) return <div>Deployment not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{deployment.name}</h1>
      <div className="grid gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">{deployment.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Environment</p>
              <p className="font-medium">{deployment.environment}</p>
            </div>
            <div>
              <p className="text-gray-600">Model Type</p>
              <p className="font-medium">{deployment.model_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Framework</p>
              <p className="font-medium">{deployment.framework}</p>
            </div>
            <div>
              <p className="text-gray-600">Version</p>
              <p className="font-medium">{deployment.version}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(deployment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {deployment.description}
          </p>
        </div>

        {deployment.configuration && (
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(deployment.configuration, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 