"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GraduationCap, BookOpenCheck, Star, CheckCircle2, ArrowRightCircle } from "lucide-react";
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
  const [participant, setParticipant] = useState<any>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Step 1: Fetch participant by email
      const email = session?.user?.email;
      if (!email) return setLoading(false);
      const pRes = await fetch(`/api/participants/by-email?email=${encodeURIComponent(email)}`);
      const { participant } = await pRes.json();
      setParticipant(participant);

      if (participant) {
        // Step 2: Fetch assigned trainings
        const tRes = await fetch(`/api/participants/${participant.id}/trainings`);
        const { trainings } = await tRes.json();
        setTrainings(trainings || []);
      }
      setLoading(false);
    }
    if (status === "authenticated") load();
  }, [session?.user?.email, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl font-semibold">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-100 p-3 flex flex-col items-center">
      {/* Welcome Card */}
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl mt-6 mb-6 px-6 py-5 flex flex-col items-center gap-2 border border-blue-100">
        {participant && (
          <>
            <img
              src={session?.user?.image || "/avatar.svg"}
              alt="Profile"
              className="w-20 h-20 rounded-full shadow border-4 border-green-100 mb-2"
            />
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 text-center">Welcome, {participant.name || session?.user?.name}!</h2>
            <div className="text-blue-800 mb-1 text-sm">{participant.email}</div>
          </>
        )}
        <div className="w-full text-center mt-3">
          <div className="flex items-center justify-center gap-2 text-green-700 font-medium mb-1">
            <BookOpenCheck className="w-5 h-5" /> Assigned Trainings
          </div>
        </div>
      </div>

      {/* Trainings List */}
      <div className="w-full max-w-2xl flex flex-col gap-5">
        {trainings.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-lg py-6 px-3 text-center text-lg font-medium shadow">
            <Star className="inline mr-2 text-yellow-500" />
            No trainings assigned to you yet.
          </div>
        ) : (
          trainings.map((tr, idx) => (
            <div
              key={tr.id}
              className={`rounded-xl shadow-lg px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white border-l-8 ${tr.isActive ? "border-green-400" : "border-gray-300 opacity-70"}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-violet-700" />
                  <span className="font-bold text-lg text-blue-800">{tr.topic}</span>
                  {!tr.isActive && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">Inactive</span>
                  )}
                </div>
                <div className="text-gray-700 text-sm mt-0.5">
                  <b>Date:</b> {new Date(tr.date).toLocaleDateString()}<br />
                  <b>Trainer:</b> {tr.trainer}
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[180px]">
                {tr.feedback ? (
                  <Link
                    href={`/feedback/${tr.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-blue-800 text-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    View Feedback
                    <ArrowRightCircle className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <Link
                    href={`/feedback/${tr.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm shadow transition"
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

      {/* Static resources */}
      <div className="w-full max-w-xl mt-8">
        <div className="text-center font-bold text-green-700 mb-2">Training Materials</div>
        <div className="flex flex-col gap-3">
          <a href="/agenda.pdf" target="_blank" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-3 rounded-lg font-medium text-blue-800 transition">
            <BookOpenCheck className="w-5 h-5" /> Agenda (PDF)
          </a>
          <a href="https://drive.google.com/drive/folders/your-cmmi-docs-link" target="_blank" className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-3 rounded-lg font-medium text-green-800 transition">
            <GraduationCap className="w-5 h-5" /> CMMI Process Documents (Drive)
          </a>
        </div>
      </div>
    </div>
  );
}
