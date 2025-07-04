"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap, Star, CheckCircle2, ArrowRightCircle,
  LogOut, BarChart2, FileText, UserCheck, AlertCircle
} from "lucide-react";
import Link from "next/link";

type Training = {
  id: number;
  topic: string;
  date: string;
  trainer: string;
  isActive: boolean;
  feedback: { id: number } | null;
};

export default function ParticipantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [participant, setParticipant] = useState<any>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const email = session?.user?.email;
      if (!email) return setLoading(false);
      const pRes = await fetch(`/api/participants/by-email?email=${encodeURIComponent(email)}`);
      const { participant } = await pRes.json();
      setParticipant(participant);

      if (participant) {
        const tRes = await fetch(`/api/participants/${participant.id}/trainings`);
        let { trainings } = await tRes.json();

        // Defensive mapping for frontend to avoid blank fields
        trainings = (trainings || []).map((tr: any) => ({
          id: tr.id,
          topic: tr.topic && tr.topic.trim() ? tr.topic : "Untitled",
          date: tr.date && tr.date.trim() ? tr.date : "",
          trainer: tr.trainer && tr.trainer.trim() ? tr.trainer : "Not Assigned",
          isActive: typeof tr.isActive === "boolean" ? tr.isActive : false,
          feedback: tr.feedback ?? null,
        }));

        setTrainings(trainings);
      }
      setLoading(false);
    }
    if (status === "authenticated") load();
  }, [session?.user?.email, status]);

  // Infographics
  const totalTrainings = trainings.length;
  const attendedTrainings = trainings.filter(t => t.feedback).length;
  const pendingFeedback = trainings.filter(t => !t.feedback).length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-white flex flex-col items-center relative px-2 py-4">
      {/* Profile Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl mt-3 px-6 py-6 flex items-center gap-4 border border-blue-100 relative">
        <img
          src={session?.user?.image || "/avatar.svg"}
          alt="Profile"
          className="w-16 h-16 rounded-full shadow border-2 border-blue-100 object-cover bg-blue-50"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-blue-900 truncate">
            Welcome, {participant?.name || session?.user?.name}!
          </h2>
          <div className="text-blue-700 text-sm truncate">{participant?.email}</div>
        </div>
        <button
          title="Logout"
          onClick={async () => {
            await signOut({ callbackUrl: "/api/auth/signin" });
          }}
          className="ml-2 p-2 rounded-full bg-red-50 hover:bg-red-100 transition"
        >
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Infographics */}
      <div className="w-full max-w-md flex justify-between gap-3 mt-4 mb-2">
        <div className="flex-1 flex flex-col items-center bg-blue-100 rounded-xl py-3 shadow">
          <BarChart2 className="w-6 h-6 text-blue-500 mb-1" />
          <span className="text-xl font-bold text-blue-900">{totalTrainings}</span>
          <span className="text-xs text-blue-800">Total Trainings</span>
        </div>
        <div className="flex-1 flex flex-col items-center bg-green-100 rounded-xl py-3 shadow">
          <UserCheck className="w-6 h-6 text-green-600 mb-1" />
          <span className="text-xl font-bold text-green-800">{attendedTrainings}</span>
          <span className="text-xs text-green-800">Attended</span>
        </div>
        <div className="flex-1 flex flex-col items-center bg-yellow-100 rounded-xl py-3 shadow">
          <AlertCircle className="w-6 h-6 text-yellow-600 mb-1" />
          <span className="text-xl font-bold text-yellow-800">{pendingFeedback}</span>
          <span className="text-xs text-yellow-800 text-center">Feedback<br />Not Given</span>
        </div>
      </div>

      {/* Trainings List */}
      <div className="w-full max-w-2xl mt-6 flex flex-col gap-5 mb-8">
        <div className="flex items-center gap-2 mb-2 pl-1">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-blue-900">Assigned Trainings</h3>
        </div>
        {trainings.length === 0 ? (
          <div className="bg-white border border-blue-100 text-blue-700 rounded-xl py-7 px-4 text-center text-lg font-medium shadow flex flex-col items-center">
            <Star className="w-7 h-7 mb-1 text-blue-300" />
            No trainings assigned to you yet.
          </div>
        ) : (
          trainings.map((tr) => (
            <div
              key={tr.id}
              className={`
                w-full rounded-xl px-4 py-5
                flex flex-col sm:flex-row sm:items-center sm:justify-between
                gap-2 shadow border transition
                ${tr.isActive
                  ? "bg-white border-blue-200"
                  : "bg-blue-50 border-blue-100 opacity-90"
                }
                hover:shadow-lg
              `}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <GraduationCap className="w-5 h-5 text-blue-700" />
                  <span className="font-semibold text-base text-blue-900 truncate">
                    {tr.topic}
                  </span>
                  {!tr.isActive && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Inactive</span>
                  )}
                </div>
                <div className="text-blue-700 text-xs sm:text-sm mt-1">
                  <b>Date:</b>{" "}
                  {tr.date && !isNaN(Date.parse(tr.date))
                    ? new Date(tr.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
                    : <span className="text-red-500">Not Available</span>
                  }
                  <br />
                  <b>Trainer:</b> {tr.trainer}
                </div>
              </div>
              <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                {tr.feedback ? (
                  <Link
                    href={`/feedback/${tr.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-blue-700 text-xs sm:text-sm transition shadow"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    View Feedback
                    <ArrowRightCircle className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <Link
                    href={`/feedback/${tr.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm shadow transition"
                  >
                    <Star className="w-4 h-4 text-yellow-300" />
                    Submit Feedback
                    <ArrowRightCircle className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
