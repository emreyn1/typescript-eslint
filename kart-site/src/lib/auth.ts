import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyTOTP } from '@/lib/totp';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
          if (!credentials.twoFactorCode) {
            throw new Error('2FA_REQUIRED');
          }

          if (!user.twoFactorSecret) {
            throw new Error('2FA configuration error');
          }

          const isValidCode = verifyTOTP(user.twoFactorSecret, credentials.twoFactorCode);

          if (!isValidCode) {
            throw new Error('Invalid 2FA code');
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Log successful login
      if (user.id) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'login',
              details: '{}',
            },
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
