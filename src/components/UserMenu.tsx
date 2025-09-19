"use client";

import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
// NeonAuth removed for liquid design
import { User, Settings } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="relative group">
        <Button variant="ghost" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-white">{session.user.name || session.user.email}</span>
        </Button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="py-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted">
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <div className="px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="default" size="sm">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}

export function MobileUserMenu() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="px-4 py-2">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{session.user.name || session.user.email}</div>
            <div className="text-xs text-muted-foreground">Signed in</div>
          </div>
        </div>
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <div className="px-3">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2">
      <div className="w-full">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="w-full">
            Sign In
          </Button>
        </Link>
      </div>
      <div className="w-full">
        <Link href="/signup">
          <Button variant="default" size="sm" className="w-full">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
