// src/lib/auth.ts
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const exists = await prisma.participant.findUnique({
        where: { email: user.email! },
      });
      return !!exists;
    },
  },
  pages: {
    error: "/not-registered",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
