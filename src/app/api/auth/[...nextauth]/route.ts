// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const admin = await prisma.admin.findUnique({
          where: { email: session.user.email },
        });
        
        return {
          ...session,
          user: {
            ...session.user,
            isAdmin: !!admin,
            adminName: admin?.name || session.user.name,
            avatar: admin?.avatar || session.user.image,
          }
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 10 * 60, // 10 minutes
  },
  pages: {
    signIn: "/select-role",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };