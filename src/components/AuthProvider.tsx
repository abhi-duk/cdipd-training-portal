"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

function AuthEnforcer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/select-role");
      return;
    }

    const user = session.user as any;
    const role = localStorage.getItem("cdipd_role");

    if (pathname.startsWith("/admin")) {
      if (!user.isAdmin) {
        alert("You are not an admin!");
        signOut();
        router.replace("/select-role");
        return;
      }
      if (role !== "admin") {
        router.replace("/select-role");
        return;
      }
    } else if (pathname.startsWith("/participant")) {
      if (role !== "participant") {
        router.replace("/select-role");
        return;
      }
    }

    // Inactivity logout
    let timer: NodeJS.Timeout;
    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut();
        router.replace("/select-role");
      }, INACTIVITY_TIMEOUT);
    }
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [status, session, router, pathname]);

  return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthEnforcer>{children}</AuthEnforcer>
    </SessionProvider>
  );
}
