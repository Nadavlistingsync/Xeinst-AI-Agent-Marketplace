import { DefaultSession, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      subscriptionTier: 'free' | 'basic' | 'premium';
    } & DefaultSession["user"];
  }
  interface User extends NextAuthUser {
    role: string;
    subscriptionTier: 'free' | 'basic' | 'premium';
  }
}

declare global {
  interface HTMLInputElement {
    webkitdirectory: boolean;
    directory: boolean;
  }
}

export {}; 