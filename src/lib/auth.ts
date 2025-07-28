import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { hash, compare } from "bcryptjs";
import { prisma } from "./prisma";
import { UserRole, SubscriptionTier } from '@prisma/client';
import type { User } from '@/types/prisma';
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      credits: true,
      stripeCustomerId: true,
      subscriptionId: true,
      subscriptionStatus: true,
    },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      credits: true,
      stripeCustomerId: true,
      subscriptionId: true,
      subscriptionStatus: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
}): Promise<User> {
  const hashedPassword = await hash(data.password, 10);

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
      subscriptionTier: data.subscriptionTier || 'free',
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      credits: true,
      stripeCustomerId: true,
      subscriptionId: true,
      subscriptionStatus: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    image?: string;
    role?: UserRole;
    subscriptionTier?: SubscriptionTier;
  }
): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      credits: true,
      stripeCustomerId: true,
      subscriptionId: true,
      subscriptionStatus: true,
    },
  });
}

export async function deleteUser(id: string): Promise<User> {
  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      password: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
      updatedAt: true,
      credits: true,
      stripeCustomerId: true,
      subscriptionId: true,
      subscriptionStatus: true,
    },
  });
} 