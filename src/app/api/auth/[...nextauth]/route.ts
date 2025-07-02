// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Only export the Route Handler methods Next.js expects:
export { handler as GET, handler as POST };
