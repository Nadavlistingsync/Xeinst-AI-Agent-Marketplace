import { DefaultSession } from 'next-auth';
import { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      subscription_tier: 'free' | 'basic' | 'premium';
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    subscription_tier: 'free' | 'basic' | 'premium';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    subscription_tier: string;
  }
} 