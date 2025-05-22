import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 