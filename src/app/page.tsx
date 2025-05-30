'use client';

export default function Home() {
  return (
    <main className="bg-[#0a1020] text-white font-sans">
      {/* Hero Section */}
      <section className="w-full py-28 bg-gradient-to-br from-[#0a1020] to-[#181c2a] text-center">
        <div className="container mx-auto max-w-3xl flex flex-col items-center justify-center">
          <span className="inline-block bg-[#00b4ff]/15 text-[#00b4ff] font-bold text-lg rounded-full px-6 py-2 mb-8 border border-[#00b4ff]">🚀 Next-Gen AI Solutions</span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Transform Your Business with <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00b4ff] to-purple-400">AI Solutions</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">Unlock the power of custom AI. We build, deploy, and support next-gen AI agents tailored to your business—fast, secure, and scalable.</p>
          <a href="#contact" className="inline-block bg-[#00b4ff] hover:bg-[#0090cc] text-white font-bold text-xl rounded-xl px-10 py-4 shadow-lg transition-all duration-300">Get Started</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-[#181c2a]">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">Why Choose Our Platform?</h2>
          <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch">
            <div className="flex-1 bg-white/5 border border-[#00b4ff]/10 rounded-2xl shadow-xl p-10 text-center hover:border-[#00b4ff] hover:shadow-[#00b4ff]/20 transition-all duration-300">
              <span className="block text-4xl mb-4 text-[#00b4ff]">✅</span>
              <h3 className="text-xl font-bold mb-2">Verified Agents</h3>
              <p className="text-gray-300">All agents are thoroughly tested and verified for quality and performance.</p>
            </div>
            <div className="flex-1 bg-white/5 border border-[#00b4ff]/10 rounded-2xl shadow-xl p-10 text-center hover:border-[#00b4ff] hover:shadow-[#00b4ff]/20 transition-all duration-300">
              <span className="block text-4xl mb-4 text-[#00b4ff]">⚡</span>
              <h3 className="text-xl font-bold mb-2">Easy Integration</h3>
              <p className="text-gray-300">Simple deployment process with comprehensive documentation and support.</p>
            </div>
            <div className="flex-1 bg-white/5 border border-[#00b4ff]/10 rounded-2xl shadow-xl p-10 text-center hover:border-[#00b4ff] hover:shadow-[#00b4ff]/20 transition-all duration-300">
              <span className="block text-4xl mb-4 text-[#00b4ff]">🌐</span>
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-gray-300">Join a growing community of developers and users sharing their experiences.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
