import { NextAuthOptions } from "next-auth";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github') {
        // Check if user exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1);

        if (!existingUser) {
          // Create new user
          await db.insert(users).values({
            email: user.email!,
            full_name: user.name,
            password: '', // Required field, but not used for GitHub auth
          });
        }
      }
      return true;
    },
    async session({ session }) {
      if (session?.user) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email!))
          .limit(1);

        if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ session }) {
      console.log('User signed out:', session?.user?.email);
    },
  },
};

export async function getServerSession() {
  try {
    return await getNextAuthServerSession(authOptions);
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
} 