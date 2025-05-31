import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prismaClient from "./db";
import { User } from "./schema";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prismaClient.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscriptionTier = token.subscriptionTier as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
      }
      return token;
    },
  },
};

export async function getUserById(id: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  image?: string;
}): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prismaClient.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: "user",
      subscriptionTier: "free",
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    subscriptionTier?: string;
  }
): Promise<User> {
  return await prismaClient.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string): Promise<User> {
  return await prismaClient.user.delete({
    where: { id },
  });
} 