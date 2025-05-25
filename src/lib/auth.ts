import { NextAuthOptions } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { getServerSession as getNextAuthServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
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