import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import prismaClient from "./db";
import { User } from "./schema";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
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
          return null;
        }

        const user = await prismaClient.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
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
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
        session.user.role = token.role as string;
        session.user.subscriptionTier = token.subscriptionTier as 'free' | 'basic' | 'premium';
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await prismaClient.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
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
      };
    },
  },
};

export async function getUserById(id: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
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
    },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
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
    },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  image?: string;
}): Promise<User> {
  const hashedPassword = await hash(data.password, 10);

  return await prismaClient.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: "user",
      subscriptionTier: "free",
      emailVerified: null,
    },
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
    subscriptionTier?: 'free' | 'basic' | 'premium';
  }
): Promise<User> {
  return await prismaClient.user.update({
    where: { id },
    data,
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
    },
  });
}

export async function deleteUser(id: string): Promise<User> {
  return await prismaClient.user.delete({
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
    },
  });
} 