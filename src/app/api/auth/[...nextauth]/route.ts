// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // only allow participants in your DB
      const exists = await prisma.participant.findUnique({
        where: { email: user.email! },
      });
      return Boolean(exists);
    },
    async session({ session }) {
      // optionally add user data to session
      return session;
    },
  },
  pages: {
    error: "/not-registered", // your custom “not registered” page
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);

// Route Handlers must export GET and POST
export { handler as GET, handler as POST };
