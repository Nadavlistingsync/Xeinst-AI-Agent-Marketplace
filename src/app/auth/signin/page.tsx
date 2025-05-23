'use client';

import { signIn } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { useState } from 'react';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-[#24292F] text-white py-3 px-4 rounded-lg hover:bg-[#1B1F23] transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaGithub className="w-5 h-5" />
          <span>{isLoading ? 'Signing in...' : 'Continue with GitHub'}</span>
        </button>
      </div>
    </div>
  );
} 