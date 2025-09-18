"use client";

import Link from "next/link";
import { ArrowRight, Rocket, Shield, Sparkles, UploadCloud, Users, Zap } from "lucide-react";

const stats = [
  { value: "1,000+", label: "Active Agents" },
  { value: "50K+", label: "Credits Earned" },
  { value: "500+", label: "Happy Creators" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  {
    title: "AI Agent Marketplace",
    description: "Discover battle-tested agents that solve real business problems right out of the box.",
    icon: Sparkles,
  },
  {
    title: "Instant Deployment",
    description: "Launch agents in minutes with zero infrastructure to manage.",
    icon: Rocket,
  },
  {
    title: "Community Driven",
    description: "Collaborate with a global network of builders and share best practices.",
    icon: Users,
  },
  {
    title: "Monetize Your Work",
    description: "Publish your agents and earn recurring credits from every execution.",
    icon: UploadCloud,
  },
];

const steps = [
  {
    title: "Browse & Discover",
    description: "Explore curated categories to find the perfect agent for your workflow.",
    icon: Sparkles,
  },
  {
    title: "Purchase Credits",
    description: "Choose flexible pricing plans and unlock premium agent capabilities instantly.",
    icon: Shield,
  },
  {
    title: "Execute & Get Results",
    description: "Run agents directly in the browser and receive actionable outputs in seconds.",
    icon: Zap,
  },
];

export default function HomePage() {
  const handleSentryTest = () => {
    console.error("Sentry test error triggered from homepage");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-black via-blue-950/30 to-black py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              The Future of AI is <span className="text-blue-400">Marketplace-Driven</span>
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Connect, create, and monetize AI agents across every workflow with Xeinst Marketplace.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Upload Your Agent
              </Link>
              <button
                type="button"
                onClick={handleSentryTest}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Test Sentry Error
              </button>
            </div>
            <div className="mt-8">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                <div className="mt-2 text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center">Why Choose Xeinst</h2>
            <p className="mt-4 text-center text-white/70">
              Built for teams who need production-ready AI agents without the integration headaches.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <Icon className="h-10 w-10 text-blue-400" />
                    <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-white/70">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white/5">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center">How It Works</h2>
            <p className="mt-4 text-center text-white/70">
              Get started with AI agents in three simple steps.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur">
                    <Icon className="mx-auto h-10 w-10 text-blue-400" />
                    <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-white/70">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
              <h2 className="text-3xl font-bold">Ready to launch your agent?</h2>
              <p className="mt-4 text-white/70">
                Join thousands of builders who trust Xeinst to distribute, monitor, and monetize their AI agents.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-600"
                >
                  View Marketplace
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Upload Your Agent
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}