'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface DashboardHeaderProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    credits: number;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back, {user.name || 'User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Manage your AI agents and monitor their performance
          </p>
          <div className="flex items-center gap-4">
            <span className="text-blue-600 font-bold">Credits: {user.credits}</span>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => window.dispatchEvent(new CustomEvent('openBuyCreditsModal'))}
            >
              Buy Credits
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 