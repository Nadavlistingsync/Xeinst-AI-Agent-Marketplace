import { DefaultSession, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      subscription_tier?: string;
    } & DefaultSession["user"];
  }
  interface User extends NextAuthUser {
    role?: string;
    subscription_tier?: string;
  }
}

declare global {
  interface HTMLInputElement {
    webkitdirectory: boolean;
    directory: boolean;
  }
}

export {}; 