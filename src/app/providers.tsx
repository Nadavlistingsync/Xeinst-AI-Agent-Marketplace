'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorProvider } from '@/contexts/ErrorContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorProvider>
        {children}
      </ErrorProvider>
    </SessionProvider>
  );
} 