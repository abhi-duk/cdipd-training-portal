import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// **Only** these two exports—no others!  
export { handler as GET, handler as POST };
