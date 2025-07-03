"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, Printer, LogOut, Home } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const RATING_ICONS = [
  { color: "text-red-400", label: "Poor" },
  { color: "text-orange-400", label: "Fair" },
  { color: "text-yellow-400", label: "Good" },
  { color: "text-blue-500", label: "Very Good" },
  { color: "text-green-600", label: "Excellent" },
];

const INITIAL_FEEDBACK = {
  trainerExplanation: 3,
  trainerKnowledge: 3,
  trainerEngagement: 3,
  trainerAnswering: 3,
  contentRelevance: 3,
  contentClarity: 3,
  contentOrganization: 3,
  infrastructureComfort: 3,
  seatingArrangement: 3,
  venueLocation: 3,
  overallSatisfaction: 3,
  recommendTraining: false,
  additionalComments: "",
};

export default function FeedbackFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ trainingId: string }>();
  const trainingId = params.trainingId;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(INITIAL_FEEDBACK);
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState(false); // for printable mode
  const [training, setTraining] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      // Get training details
      const tRes = await fetch(`/api/trainings/${trainingId}`);
      if (tRes.ok) setTraining((await tRes.json()).training);

      // Get participantId
      const pRes = await fetch(`/api/participants/by-email?email=${encodeURIComponent(session?.user?.email || "")}`);
      const { participant } = await pRes.json();
      setParticipant(participant);
      if (!participant) {
        setErrorMsg("You are not a registered participant!");
        setLoading(false);
        return;
      }

      // Get feedback for this participant+training
      const fRes = await fetch(`/api/feedback/${trainingId}?participantId=${participant.id}`);
      if (fRes.ok) {
        const { feedback } = await fRes.json();
        if (feedback) {
          setFeedback(feedback);
          setSubmitted(true);
        }
      }
      setLoading(false);
    }
    if (session?.user?.email) load();
  }, [session?.user?.email, trainingId]);

  // Handle feedback change
  function handleRate(field: string, value: number) {
    setFeedback((f: any) => ({ ...f, [field]: value }));
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target;
    setFeedback((f: any) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const pRes = await fetch(`/api/participants/by-email?email=${encodeURIComponent(session?.user?.email || "")}`);
    const { participant } = await pRes.json();
    if (!participant) {
      toast.error("Not a valid participant!");
      setLoading(false);
      return;
    }
    // POST feedback
    const postRes = await fetch(`/api/feedback/${trainingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...feedback, participantId: participant.id }),
    });

    if (postRes.status === 409) {
      toast.error("Feedback already submitted! You cannot update it.");
      setSubmitted(true);
      setViewMode(true);
      setLoading(false);
      return;
    }
    if (postRes.ok) {
      toast.success("Feedback submitted!");
      setSubmitted(true);
      setViewMode(true);
    } else {
      let err = { error: "Could not submit feedback" };
      try { err = await postRes.json(); } catch (_) {}
      setErrorMsg(err?.error || "Could not submit feedback");
      toast.error(err?.error || "Could not submit feedback");
    }
    setLoading(false);
  }

  function printPage() {
    window.print();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-blue-700">Loading...</div>;
  }

  // --- PARTICIPANT HEADER ---
  function UserHeader() {
    return (
      <div className="w-full flex flex-col md:flex-row items-center md:justify-between gap-3 bg-white/60 rounded-xl shadow px-4 py-3 mb-6 sticky top-0 z-10 print:static print:mb-4">
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-green-300 object-cover shadow"
            />
          )}
          <div>
            <div className="font-bold text-green-900 text-lg">{session?.user?.name}</div>
            <div className="text-sm text-gray-600">{session?.user?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0 print:hidden">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-semibold shadow">
              <Home className="w-5 h-5" /> Dashboard
            </button>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-semibold shadow"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    );
  }

  // --- PRINTABLE VIEW (shows participant details too) ---
  if (submitted && viewMode) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-green-100 p-4 print:bg-white">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 print:shadow-none print:border">
          {/* Participant Info - PRINTABLE */}
          <div className="mb-4 flex items-center gap-3 border-b border-blue-200 pb-3">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-green-300 object-cover shadow print:shadow-none"
              />
            )}
            <div>
              <div className="font-bold text-green-900 text-lg">{session?.user?.name || participant?.name}</div>
              <div className="text-sm text-gray-700">{session?.user?.email || participant?.email}</div>
              <div className="text-sm text-gray-500">Designation: {participant?.designation || "--"}</div>
              <div className="text-sm text-gray-500">Department: {participant?.dept || "--"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-green-700">Thank you for your feedback!</span>
          </div>
          <div className="mb-4 text-gray-700">
            <b>Training:</b> {training?.topic} <br />
            <b>Trainer:</b> {training?.trainer}
          </div>
          <hr className="my-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            {Object.entries(feedback)
              .filter(([k, v]) => typeof v === "number")
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>:
                  <span className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 transition-all duration-300 ${i < value ? RATING_ICONS[i].color : "text-gray-300"}`}
                        fill={i < value ? "currentColor" : "none"}
                      />
                    ))}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-4 text-base">
            <b>Recommend Training:</b> {feedback.recommendTraining ? "Yes" : "No"}
          </div>
          <div className="mt-2 text-base">
            <b>Additional Comments:</b><br />
            <span className="block mt-1 p-2 bg-blue-50 rounded border min-h-[40px]">{feedback.additionalComments || "—"}</span>
          </div>
          <div className="mt-8 flex gap-3 print:hidden">
            <button onClick={printPage} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 print:hidden">
              <Printer className="w-5 h-5" /> Print
            </button>
            <Link href="/dashboard">
              <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2 print:hidden">
                <Home className="w-5 h-5" /> Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- FEEDBACK FORM (with participant header) ---
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-green-100 p-4">
      <UserHeader />
      <form
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 space-y-6 animate-fadeIn"
        onSubmit={handleSubmit}
      >
        <div className="mb-2 text-2xl font-bold text-blue-900 flex items-center gap-2">
          <Star className="w-7 h-7 text-yellow-400 animate-bounce" />
          Training Feedback
        </div>
        <div className="mb-4 text-blue-900 font-semibold text-lg">
          {training?.topic && <>{training.topic} <span className="font-normal text-gray-600">| Trainer: {training.trainer}</span></>}
        </div>
        {errorMsg && <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4">{errorMsg}</div>}
        {/* Sectioned and animated ratings */}
        <div className="space-y-3">
          <div className="font-semibold text-green-800">About the Trainer</div>
          {[
            { field: "trainerExplanation", label: "Explanation" },
            { field: "trainerKnowledge", label: "Knowledge" },
            { field: "trainerEngagement", label: "Engagement" },
            { field: "trainerAnswering", label: "Answering Queries" },
          ].map(({ field, label }) => (
            <RatingRow
              key={field}
              label={label}
              value={feedback[field]}
              onRate={val => handleRate(field, val)}
            />
          ))}
        </div>
        <div className="space-y-3">
          <div className="font-semibold text-green-800 mt-6">About the Content</div>
          {[
            { field: "contentRelevance", label: "Relevance" },
            { field: "contentClarity", label: "Clarity" },
            { field: "contentOrganization", label: "Organization" },
          ].map(({ field, label }) => (
            <RatingRow
              key={field}
              label={label}
              value={feedback[field]}
              onRate={val => handleRate(field, val)}
            />
          ))}
        </div>
        <div className="space-y-3">
          <div className="font-semibold text-green-800 mt-6">About Infrastructure</div>
          {[
            { field: "infrastructureComfort", label: "Overall Comfort" },
            { field: "seatingArrangement", label: "Seating Arrangement" },
            { field: "venueLocation", label: "Venue/Online Setup" },
          ].map(({ field, label }) => (
            <RatingRow
              key={field}
              label={label}
              value={feedback[field]}
              onRate={val => handleRate(field, val)}
            />
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2">
          <div className="font-semibold text-green-800">Overall Satisfaction:</div>
          <RatingRow
            value={feedback.overallSatisfaction}
            onRate={val => handleRate("overallSatisfaction", val)}
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="recommendTraining"
            name="recommendTraining"
            checked={feedback.recommendTraining}
            onChange={handleChange}
            className="h-5 w-5 accent-green-500"
          />
          <label htmlFor="recommendTraining" className="text-base text-green-700 font-medium select-none">
            I would recommend this training to my colleagues.
          </label>
        </div>
        <div className="mt-4">
          <label className="font-semibold text-green-800 mb-2 block" htmlFor="additionalComments">
            Additional Comments (optional)
          </label>
          <textarea
            id="additionalComments"
            name="additionalComments"
            rows={3}
            className="w-full rounded-lg border border-blue-200 p-3 focus:ring-2 focus:ring-blue-400 outline-none"
            value={feedback.additionalComments}
            onChange={handleChange}
            placeholder="Any suggestions or thoughts..."
          />
        </div>
        <div className="mt-8">
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 shadow-xl transition"
            disabled={loading}
          >
            <CheckCircle2 className="w-6 h-6" />
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Helper: Animated Rating Row ---
function RatingRow({ label, value, onRate }: { label?: string; value: number; onRate: (val: number) => void }) {
  return (
    <div className={`flex items-center gap-3 ${label ? "mb-2" : ""}`}>
      {label && <span className="w-40 text-gray-700">{label}</span>}
      <span className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n, idx) => (
          <button
            type="button"
            key={n}
            onClick={() => onRate(n)}
            className={`transition-all duration-200 ${value >= n ? RATING_ICONS[n - 1].color : "text-gray-300"} hover:scale-125 focus:outline-none`}
            aria-label={`${RATING_ICONS[n - 1].label}${label ? ` for ${label}` : ""}`}
          >
            <Star className={`w-7 h-7 ${value >= n ? "fill-current" : ""} drop-shadow`} />
          </button>
        ))}
      </span>
    </div>
  );
}
