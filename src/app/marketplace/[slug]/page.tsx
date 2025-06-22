import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "@/lib/db-helpers";
import AgentDetails from "@/components/marketplace/AgentDetails";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const deployment = await getDeploymentById(params.slug);

    if (!deployment) {
      return {
        title: "Agent Not Found",
      };
    }

    return {
      title: `${deployment.name} | AI Agent`,
      description: deployment.description,
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: "Error",
      description: "Failed to load agent metadata."
    }
  }
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
  try {
    const deployment = await getDeploymentById(params.slug);

    if (!deployment) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <AgentDetails deployment={deployment} />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">An Error Occurred</h1>
        <p>The application failed to load agent details. This is likely due to a database connection issue.</p>
        <p className="mt-4">Please ensure the <code>DATABASE_URL</code> environment variable is set correctly in your Vercel project settings.</p>
        <h2 className="text-xl font-bold mt-8">Error Details:</h2>
        <pre className="bg-gray-100 p-4 rounded-md mt-2 text-red-600">
          {error.message}
        </pre>
      </div>
    )
  }
} 