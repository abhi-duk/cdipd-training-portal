"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SidebarUserSection() {
  const { data: session } = useSession();

  if (!session) return null;
  const user = session.user as any;

  return (
    <div className="mt-10 border-t pt-6">
      <div className="flex items-center gap-3">
        <span className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="rounded-full w-10 h-10 object-cover"
            />
          ) : (
            (user.adminName?.[0] || user.name?.[0] || "A")
          )}
        </span>
        <div>
          <div className="font-bold truncate max-w-[110px]">
            {user.adminName || user.name}
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 text-red-300 hover:text-red-100 text-sm mt-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
