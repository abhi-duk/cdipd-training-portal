"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shield, User } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();

  async function handleRole(role: "admin" | "participant") {
    // Store preferred role in localStorage or a cookie/session (for later use)
    localStorage.setItem("cdipd_role", role);
    // Redirect to login
    await signIn("google", { callbackUrl: role === "admin" ? "/admin" : "/participant" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full">
        <h2 className="text-3xl font-bold text-blue-800">Select Login Mode</h2>
        <button
          onClick={() => handleRole("admin")}
          className="flex items-center gap-3 px-6 py-3 bg-blue-700 text-white text-xl rounded-xl hover:bg-blue-800 font-bold w-full justify-center shadow"
        >
          <Shield className="w-6 h-6" />
          Login as Admin
        </button>
        <button
          onClick={() => handleRole("participant")}
          className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white text-xl rounded-xl hover:bg-green-700 font-bold w-full justify-center shadow"
        >
          <User className="w-6 h-6" />
          Login as Participant
        </button>
      </div>
    </div>
  );
}
