import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  providers: [
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
        name: "Email & Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          // Kita butuh prisma client di sini, tapi auth.config harus ringan.
          // Khusus untuk v5, kita bisa impor prisma di sini meski berisiko edge-incompatible
          // jika middleware memicu jalur authorize ini. Namun biasanya authorize hanya dipicu oleh signIn()
          const { prisma } = await import("@/lib/prisma");
          const bcrypt = await import("bcrypt");

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) return null;

          return { 
              id: user.id, 
              name: user.name, 
              email: user.email,
              image: user.image
          };
        }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig
