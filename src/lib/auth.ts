import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";
import { User, UserRole, SubscriptionTier } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
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

        if (!user || !user.password) {
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
          password: user.password,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role as UserRole;
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
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