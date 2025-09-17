"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { LogIn, UserPlus, LogOut, User } from "lucide-react";

export function NeonAuth() {
  return <SignInButton />;
}

// Sign In Component
export function SignInButton() {
  return (
    <Link href="/login">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </Link>
  );
}

// Sign Up Component
export function SignUpButton() {
  return (
    <Link href="/signup">
      <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        <UserPlus className="w-4 h-4" />
        Sign Up
      </Button>
    </Link>
  );
}

// User Profile Component
export function UserProfile() {
  const { data: session } = useSession();
  
  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <User className="w-4 h-4" />
        {session.user?.name || session.user?.email}
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => signOut()}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}
