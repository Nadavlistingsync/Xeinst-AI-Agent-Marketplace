"use client";

import { useUser } from "@stackframe/stack";
import { Button } from ".//ui/button";
import { SignInButton, SignUpButton, UserProfile } from "./NeonAuth";
import { User, Settings } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const user = useUser();

  if (user) {
    return (
      <div className="relative group">
        <Button variant="ghost" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-ai-primary to-ai-secondary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-white">{user.displayName || user.primaryEmail}</span>
        </Button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="py-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted">
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <div className="px-4 py-2">
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <SignInButton />
      <SignUpButton />
    </div>
  );
}

export function MobileUserMenu() {
  const user = useUser();

  if (user) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-ai-primary to-ai-secondary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{user.displayName || user.primaryEmail}</div>
            <div className="text-xs text-muted-foreground">Signed in</div>
          </div>
        </div>
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <div className="px-3">
            <UserProfile />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2">
      <div className="w-full">
        <SignInButton />
      </div>
      <div className="w-full">
        <SignUpButton />
      </div>
    </div>
  );
}
