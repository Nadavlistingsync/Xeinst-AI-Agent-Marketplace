import React from 'react';

export default function ReplitEmbedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-12 px-4">
      <div className="mb-6 w-full max-w-2xl bg-blue-100 border-l-4 border-blue-500 text-blue-900 px-6 py-4 rounded-xl shadow">
        <strong>Note:</strong> The Replit IDE is now embedded directly in the <a href="/agent-builder" className="underline text-blue-700 hover:text-blue-900">Agent Builder</a> page for a seamless experience. You can use it there without leaving the site!
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">Interactive IDE (Powered by Replit)</h1>
      <p className="text-gray-300 mb-8 text-center max-w-xl">
        Write, run, and experiment with code right in your browser! This embedded IDE is powered by <a href="https://replit.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-200">Replit</a>.
      </p>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500 bg-black">
        <iframe
          src="https://replit.com/@replit/Python?embed=true"
          title="Replit IDE Embed"
          width="100%"
          height="600"
          frameBorder="0"
          allowFullScreen
          className="w-full min-h-[600px] bg-black"
        ></iframe>
      </div>
    </div>
  );
} 