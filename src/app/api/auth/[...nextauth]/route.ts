import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from "@auth/supabase-adapter";
import GithubProvider from "next-auth/providers/github";

const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // You can add custom logic here, like creating a user record in your database
      console.log('User signed in:', user.email);
    },
    async signOut({ session, token }) {
      // You can add custom logic here, like cleaning up user data
      console.log('User signed out:', session?.user?.email);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 