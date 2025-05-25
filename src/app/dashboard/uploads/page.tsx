"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadsDashboard() {
  const { data: session } = useSession();
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchUploads = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("uploaded_by", session.user.email)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setUploads(data || []);
      } catch (err) {
        setError("Failed to fetch uploads");
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, [session?.user?.email]);

  if (!session) return <div className="text-center mt-20">Sign in to view your uploads.</div>;
  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white/10 rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-white">My Uploaded Agents</h1>
      {uploads.length === 0 ? (
        <div className="text-gray-300">You haven't uploaded any agents yet.</div>
      ) : (
        <ul className="space-y-6">
          {uploads.map((agent) => (
            <li key={agent.id} className="bg-black/30 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-xl font-semibold text-white">{agent.name}</div>
                <div className="text-gray-300">{agent.description}</div>
                <div className="text-gray-400 text-sm mt-2">{agent.download_count} downloads</div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Edit</button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 