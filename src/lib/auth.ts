import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { hash } from "bcryptjs";
import { prisma } from "./prisma";
import { User, UserRole, SubscriptionTier } from "../types/prisma";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          subscriptionTier: true,
          password: true,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
        subscriptionTier: dbUser.subscriptionTier,
        password: dbUser.password,
      };
    },
  },
};

export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      password: true,
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
      image: true,
      role: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      password: true,
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
      role: data.role || UserRole.user,
      subscriptionTier: data.subscriptionTier || SubscriptionTier.free,
      emailVerified: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      subscriptionTier: true,
      password: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
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
      image: true,
      role: true,
      subscriptionTier: true,
      password: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
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
      image: true,
      role: true,
      subscriptionTier: true,
      password: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
} 