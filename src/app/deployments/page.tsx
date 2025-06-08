import { getDeployments } from "@/lib/db-helpers";
import Link from "next/link";

export default async function DeploymentsPage() {
  const deployments = await getDeployments({});

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
        <div className="grid gap-6">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{deployment.name}</h2>
              <p className="text-gray-600 mb-2">{deployment.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Status: {deployment.status}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(deployment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 