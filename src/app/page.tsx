"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpenCheck, Shield } from "lucide-react";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") return null;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-sky-100 via-white to-green-100 px-3">
      <div className="bg-white/80 shadow-xl rounded-2xl p-8 max-w-sm w-full flex flex-col items-center">
        <span className="mb-4 flex items-center justify-center gap-2 text-sky-700">
          <Shield className="w-9 h-9 text-blue-500" />
          <GraduationCap className="w-9 h-9 text-green-600" />
        </span>
        <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-2 tracking-tight leading-snug">
          CDIPD Training Portal
        </h1>
        <div className="text-center text-md text-blue-800 font-medium mb-6">
          For Internal Trainings, Feedback, &amp; Certificate Downloads<br />
          <span className="block text-xs mt-1 text-gray-600 font-normal">by Centre for Digital Innovation and Product Development (CDIPD), Digital University Kerala</span>
        </div>
        <BookOpenCheck className="w-12 h-12 text-green-500 mb-5" />
        <button
          className="flex items-center justify-center w-full gap-3 bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-800 font-bold py-3 rounded-xl text-lg shadow-lg transition active:scale-95"
          onClick={() => signIn("google")}
        >
          <svg className="w-7 h-7" viewBox="0 0 48 48">
            <g>
              <circle cx="24" cy="24" r="24" fill="#fff"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-1.4 3.7-4.8 6-8.6 6-5 0-9-4-9-9s4-9 9-9c2.2 0 4.2.8 5.7 2.1l6-6C35.5 8.2 30 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 17.5-6.8 17.5-17.5 0-1.2-.1-2.3-.3-3.5z" fill="#4285f4"/>
              <path d="M6.3 14.7l6.6 4.8C14.1 16 18.7 13 24 13c2.2 0 4.2.7 5.7 2.1l6-6C32.8 6.5 28.7 5 24 5c-7.6 0-14.3 4.2-17.7 10.7z" fill="#34a853"/>
              <path d="M24 43c5.4 0 10.4-1.7 14.2-4.7l-6.7-5.5c-2 .9-4.1 1.3-6.5 1.3-4.1 0-7.7-2.6-9-6.4l-6.7 5.2C9.6 39.2 16.3 43 24 43z" fill="#fbbc04"/>
              <path d="M43.6 20.5h-1.8V20H24v8h11.2c-1.1 2.9-4.1 6-8.6 6-5 0-9-4-9-9s4-9 9-9c2.2 0 4.2.7 5.7 2.1l6-6C35.5 8.2 30 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 17.5-6.8 17.5-17.5 0-1.2-.1-2.3-.3-3.5z" fill="none"/>
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <div className="text-xs text-gray-500 mt-5 text-center">
          <span className="font-semibold text-blue-800">Login allowed only with your official <span className="text-red-700">@duk.ac.in</span> email address.</span>
        </div>
      </div>
      <div className="mt-10 text-gray-500 text-xs text-center max-w-xs">
        &copy; {new Date().getFullYear()} CDIPD, DUK &mdash; All rights reserved.<br />
        For support, contact your Project Manager.
      </div>
    </div>
  );
}
