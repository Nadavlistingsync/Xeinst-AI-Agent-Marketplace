"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle, Zap, Users, DollarSign, Mail, Lock, User } from "lucide-react";
import { GlowButton } from "../../components/ui/GlowButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowInput } from "../../components/ui/GlowInput";
import { Section } from "../../components/ui/Section";
import { PageHeader } from "../../components/ui/PageHeader";
import { toast } from "sonner";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      toast.success("Account created successfully! Welcome to Xeinst!");
      localStorage.setItem('isNewUser', 'true');
      router.push('/upload?welcome=true');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Connect AI Agents",
      description: "Upload your AI agents in minutes with our simple webhook system"
    },
    {
      icon: Users,
      title: "Reach Global Users",
      description: "Your agents become available to thousands of users worldwide"
    },
    {
      icon: DollarSign,
      title: "Earn Credits",
      description: "Get paid every time someone uses your AI agents"
    }
  ];

  if (step === 0) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title="Start Earning with AI"
          subtitle="Connect your AI agents to our marketplace and start earning credits in minutes. No complex setup required."
          actions={
            <GlowButton size="lg" onClick={() => setStep(1)}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </GlowButton>
          }
        />

        <Section>
          <div className="space-y-16">
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlassCard className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-accent/20 mb-6">
                      <benefit.icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                    <p className="text-white/70">{benefit.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlassCard>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-glow mb-2">1,000+</div>
                    <div className="text-white/70">Active Agents</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-glow mb-2">50K+</div>
                    <div className="text-white/70">Credits Earned</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-glow mb-2">500+</div>
                    <div className="text-white/70">Happy Creators</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-accent/20 mb-4"
            >
              <Sparkles className="h-8 w-8 text-accent" />
            </motion.div>
            <h1 className="text-3xl font-bold text-glow">Create Your Account</h1>
            <p className="text-white/70 mt-2">Join thousands of AI creators earning with their agents</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <GlowInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange(e)}
              name="name"
              required
            />

            <GlowInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange(e)}
              name="email"
              required
            />

            <GlowInput
              label="Password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange(e)}
              name="password"
              required
              minLength={8}
            />

            <GlowInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange(e)}
              name="confirmPassword"
              required
            />

            <GlowButton
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </GlowButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/70">
              Already have an account?{' '}
              <Link 
                href="/auth/signin" 
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-white/50">
                By creating an account, you agree to our{' '}
                <Link href="/legal/terms" className="text-accent hover:text-accent/80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="text-accent hover:text-accent/80">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6">
            <GlowButton
              variant="glass"
              onClick={() => setStep(0)}
            >
              ← Back to overview
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}