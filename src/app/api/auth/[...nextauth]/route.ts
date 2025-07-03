import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        const admin = await prisma.admin.findUnique({
          where: { email: session.user.email },
        });
        (session.user as any).isAdmin = !!admin;
        (session.user as any).adminName = admin?.name || session.user.name;
        (session.user as any).avatar = admin?.avatar || session.user.image;
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// DO NOT export authOptions!
