import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // Attach isAdmin to session
    async session({ session }) {
      if (session?.user?.email) {
        const admin = await prisma.admin.findUnique({
          where: { email: session.user.email },
        });
        // Add admin check to session object
        (session.user as any).isAdmin = !!admin;
        (session.user as any).adminName = admin?.name || session.user.name;
        (session.user as any).avatar = admin?.avatar || session.user.image;
      }
      return session;
    },
  },
  // Optionally set session max age and update age
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 10 * 60, // 10 minutes
  },
  pages: {
    signIn: "/select-role", // use your custom role selection
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
