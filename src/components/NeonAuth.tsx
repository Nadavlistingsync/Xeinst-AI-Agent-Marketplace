"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { GlassMorphButton } from "./ui/GlassMorphButton";
import Link from "next/link";
import { LogIn, UserPlus, LogOut, User } from "lucide-react";

export function NeonAuth() {
  return <SignInButton />;
}

// Sign In Component
export function SignInButton() {
  return (
    <GlassMorphButton variant="outline" size="md" asChild>
      <Link href="/login" className="flex items-center gap-2">
        <LogIn className="w-4 h-4" />
        Sign In
      </Link>
    </GlassMorphButton>
  );
}

// Sign Up Component
export function SignUpButton() {
  return (
    <GlassMorphButton variant="primary" size="md" asChild>
      <Link href="/signup" className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Sign Up
      </Link>
    </GlassMorphButton>
  );
}

// User Profile Component
export function UserProfile() {
  const { data: session } = useSession();
  
  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="flex items-center gap-3">
      <div 
        className="flex items-center gap-3 px-4 py-2 bg-white/8 backdrop-blur-xl border border-white/20 rounded-full"
        style={{
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white">
          {session.user?.name || session.user?.email}
        </span>
      </div>
      <GlassMorphButton 
        variant="ghost" 
        size="sm" 
        onClick={() => signOut()}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </GlassMorphButton>
    </div>
  );
}
