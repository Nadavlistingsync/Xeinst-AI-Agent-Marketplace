import { getDeployments } from '@/lib/deployments';
import { formatDate } from '@/lib/utils';
import Link from "next/link";

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic';

export default async function DeploymentsPage() {
  const deployments = await getDeployments();

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
            <div
              key={deployment.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{deployment.name}</h2>
                  <p className="text-gray-600 mt-1">{deployment.description}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    deployment.status === 'active' ? 'bg-green-100 text-green-800' :
                    deployment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {deployment.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{formatDate(deployment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p>{formatDate(deployment.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Version</p>
                  <p>{deployment.version}</p>
                </div>
                <div>
                  <p className="text-gray-500">Environment</p>
                  <p>{deployment.environment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 