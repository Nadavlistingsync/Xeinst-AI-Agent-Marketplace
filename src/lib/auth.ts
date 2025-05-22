import { NextAuthOptions } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";

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
  const { getServerSession } = await import("next-auth");
  return getServerSession(authOptions);
} 