import { NextRequest, NextResponse } from 'next/server';
import CredentialsProvider from 'next-auth/providers/credentials';
import { 
  JWTService, 
  HashingService, 
  PasswordPolicy, 
  AuditLogger,
  EncryptionService 
} from "./security";
import { prisma } from "./prisma";

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user' | 'agent';
  emailVerified?: Date | null;
  image?: string | null;
  subscriptionTier: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  credits: number;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin' | 'agent';
}

// Authentication service
export class AuthService {
  // Register a new user
  static async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate password policy
      const passwordValidation = PasswordPolicy.validate(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await HashingService.hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || 'user',
        },
      });

      // Log registration
      AuditLogger.log('USER_REGISTERED', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          emailVerified: user.emailVerified,
          image: user.image,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          credits: user.credits,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // User is active if they exist in the database

      // Verify password
      if (!user.password) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
      
      const isPasswordValid = await HashingService.verifyPassword(credentials.password, user.password);
      if (!isPasswordValid) {
        AuditLogger.log('LOGIN_FAILED', {
          userId: user.id,
          email: credentials.email,
          reason: 'invalid_password',
        });
        
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last login (we'll use updatedAt field)
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = JWTService.generateToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken(tokenPayload);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Log successful login
      AuditLogger.log('LOGIN_SUCCESS', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        session: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as any,
            emailVerified: user.emailVerified,
            image: user.image,
            subscriptionTier: user.subscriptionTier,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            credits: user.credits,
          },
          token,
          refreshToken,
          expiresAt,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const payload = JWTService.verifyToken(token);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          emailVerified: user.emailVerified,
          image: user.image,
          subscriptionTier: user.subscriptionTier,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          credits: user.credits,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const payload = JWTService.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Generate new token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newToken = JWTService.generateToken(tokenPayload);

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid refresh token',
      };
    }
  }

  // Logout user
  static async logout(userId: string): Promise<{ success: boolean }> {
    try {
      // Log logout
      AuditLogger.log('LOGOUT', userId);
      
      // In a real implementation, you might want to blacklist the token
      // or store it in a database for validation
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Verify current password
      if (!user.password) {
        return {
          success: false,
          error: 'No password set for this account',
        };
      }
      
      const isCurrentPasswordValid = await HashingService.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Validate new password
      const passwordValidation = PasswordPolicy.validate(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        };
      }

      // Hash new password
      const hashedNewPassword = await HashingService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Log password change
      AuditLogger.log('PASSWORD_CHANGED', userId);

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Failed to change password. Please try again.',
      };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not
        return { success: true };
      }

      // Generate reset token
      const resetToken = EncryptionService.encrypt(`${user.id}:${Date.now()}`);
      
      // Store reset token (in a real implementation, you'd store this in the database)
      // For now, we'll just log it
      AuditLogger.log('PASSWORD_RESET_REQUESTED', {
        userId: user.id,
        email: user.email,
        resetToken: resetToken.substring(0, 20) + '...', // Log only first 20 chars
      });

      // In a real implementation, you'd send an email with the reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Failed to process password reset request',
      };
    }
  }
}

// Middleware for protecting routes
export function withAuth(handler: any, requiredRole?: string) {
  return async (request: NextRequest, context: any) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const token = authHeader.substring(7);
      
      // Verify token
      const tokenResult = await AuthService.verifyToken(token);
      if (!tokenResult.success || !tokenResult.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Check role if required
      if (requiredRole && tokenResult.user.role !== requiredRole) {
        return new NextResponse('Forbidden', { status: 403 });
      }

      // Add user to request context
      (request as any).user = tokenResult.user;
      
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new NextResponse('Unauthorized', { status: 401 });
    }
  };
}

// NextAuth configuration for compatibility
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use our AuthService to authenticate
          const result = await AuthService.login({
            email: credentials.email,
            password: credentials.password
          });

          if (result.success && result.session?.user) {
            return {
              id: result.session.user.id,
              email: result.session.user.email,
              name: result.session.user.name,
              role: result.session.user.role,
              subscriptionTier: result.session.user.subscriptionTier,
              credits: result.session.user.credits,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscriptionTier = token.subscriptionTier;
        session.user.credits = token.credits;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
        token.credits = user.credits;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production-please-make-it-secure-32-chars',
};

// All exports are already defined above