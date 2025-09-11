'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Bot } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowInput } from '@/components/ui/GlowInput';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        console.error('Sign in error:', result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-accent/20 mb-4"
            >
              <Bot className="h-8 w-8 text-accent" />
            </motion.div>
            <h1 className="text-3xl font-bold text-glow">Welcome Back</h1>
            <p className="text-white/70 mt-2">Sign in to your Xeinst account</p>
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

          <form onSubmit={handleSignIn} className="space-y-6">
            <GlowInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <GlowInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <GlowButton
              type="submit"
              fullWidth
              disabled={isLoading}
              className="mt-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </GlowButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/70">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-white/50">
                By signing in, you agree to our{' '}
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
        </GlassCard>
      </motion.div>
    </div>
  );
}