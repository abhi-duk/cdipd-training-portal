"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, Printer, LogOut, Home } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// All questions, options (as per doc), and which get a star display
const QUESTIONS = [
  {
    key: "trainerExplanation",
    section: "About Trainer",
    label: "How well did the trainer explain the topics covered?",
    type: "radio",
    options: [
      { value: "Excellent", label: "Excellent" },
      { value: "Good", label: "Good" },
      { value: "Average", label: "Average" },
      { value: "Poor", label: "Poor" },
    ],
    showStars: true,
  },
  {
    key: "trainerKnowledge",
    section: "About Trainer",
    label: "Did the trainer demonstrate in-depth knowledge of the subject?",
    type: "radio",
    options: [
      { value: "Strongly Agree", label: "Strongly Agree" },
      { value: "Agree", label: "Agree" },
      { value: "Neutral", label: "Neutral" },
      { value: "Disagree", label: "Disagree" },
    ],
    showStars: false,
  },
  {
    key: "trainerEngagement",
    section: "About Trainer",
    label: "How engaging was the trainer throughout the session?",
    type: "radio",
    options: [
      { value: "Very Engaging", label: "Very Engaging" },
      { value: "Engaging", label: "Engaging" },
      { value: "Somewhat Engaging", label: "Somewhat Engaging" },
      { value: "Not Engaging", label: "Not Engaging" },
    ],
    showStars: false,
  },
  {
    key: "trainerAnswering",
    section: "About Trainer",
    label: "Was the trainer able to answer questions effectively?",
    type: "radio",
    options: [
      { value: "Always", label: "Always" },
      { value: "Most of the time", label: "Most of the time" },
      { value: "Sometimes", label: "Sometimes" },
      { value: "Rarely", label: "Rarely" },
    ],
    showStars: false,
  },
  {
    key: "contentRelevance",
    section: "Content Feedback",
    label: "How relevant was the training content to your role?",
    type: "radio",
    options: [
      { value: "Very Relevant", label: "Very Relevant" },
      { value: "Somewhat Relevant", label: "Somewhat Relevant" },
      { value: "Neutral", label: "Neutral" },
      { value: "Not Relevant", label: "Not Relevant" },
    ],
    showStars: false,
  },
  {
    key: "contentClarity",
    section: "Content Feedback",
    label: "How would you rate the clarity of the training materials?",
    type: "radio",
    options: [
      { value: "Excellent", label: "Excellent" },
      { value: "Good", label: "Good" },
      { value: "Average", label: "Average" },
      { value: "Poor", label: "Poor" },
    ],
    showStars: true,
  },
  {
    key: "contentOrganization",
    section: "Content Feedback",
    label: "Was the content organized and easy to follow?",
    type: "radio",
    options: [
      { value: "Strongly Agree", label: "Strongly Agree" },
      { value: "Agree", label: "Agree" },
      { value: "Neutral", label: "Neutral" },
      { value: "Disagree", label: "Disagree" },
    ],
    showStars: false,
  },
  {
    key: "infrastructureComfort",
    section: "Infrastructure Feedback",
    label: "Were the training facilities comfortable and conducive to learning?",
    type: "radio",
    options: [
      { value: "Strongly Agree", label: "Strongly Agree" },
      { value: "Agree", label: "Agree" },
      { value: "Neutral", label: "Neutral" },
      { value: "Disagree", label: "Disagree" },
    ],
    showStars: false,
  },
  {
    key: "seatingArrangement",
    section: "Infrastructure Feedback",
    label: "Was the seating arrangement appropriate for the training format?",
    type: "radio",
    options: [
      { value: "Strongly Agree", label: "Strongly Agree" },
      { value: "Agree", label: "Agree" },
      { value: "Neutral", label: "Neutral" },
      { value: "Disagree", label: "Disagree" },
    ],
    showStars: false,
  },
  {
    key: "venueLocation",
    section: "Infrastructure Feedback",
    label: "Was the location of the training venue convenient?",
    type: "radio",
    options: [
      { value: "Strongly Agree", label: "Strongly Agree" },
      { value: "Agree", label: "Agree" },
      { value: "Neutral", label: "Neutral" },
      { value: "Disagree", label: "Disagree" },
    ],
    showStars: false,
  },
  {
    key: "overallSatisfaction",
    section: "",
    label: "How satisfied are you with the training overall?",
    type: "radio",
    options: [
      { value: "Very Satisfied", label: "Very Satisfied" },
      { value: "Satisfied", label: "Satisfied" },
      { value: "Neutral", label: "Neutral" },
      { value: "Unsatisfied", label: "Unsatisfied" },
    ],
    showStars: true,
  },
  {
    key: "recommendTraining",
    section: "",
    label: "Would you recommend this training session to others?",
    type: "radio",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
    showStars: false,
  },
  {
    key: "additionalComments",
    section: "",
    label: "Additional comments/ suggestions",
    type: "textarea",
    options: [],
    showStars: false,
  },
];

// For "star" questions: mapping from value to star count
const STAR_MAPPING: Record<string, number> = {
  Excellent: 5,
  Good: 4,
  Average: 3,
  Poor: 1,
  "Very Satisfied": 5,
  Satisfied: 4,
  Neutral: 3,
  Unsatisfied: 1,
};

const INITIAL_FEEDBACK = Object.fromEntries(
  QUESTIONS.map((q) =>
    q.type === "textarea"
      ? [q.key, ""]
      : [q.key, q.options[0]?.value ?? ""]
  )
);

export default function FeedbackFormPage() {
  const { data: session } = useSession();
  const params = useParams<{ trainingId: string }>();
  const trainingId = params.trainingId;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(INITIAL_FEEDBACK);
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [training, setTraining] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg(null);

      // Fetch training details
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

  function handleChange(key: string, value: string) {
    setFeedback((prev: any) => ({ ...prev, [key]: value }));
  }

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
      try { err = await postRes.json(); } catch (_) { }
      setErrorMsg(err?.error || "Could not submit feedback");
      toast.error(err?.error || "Could not submit feedback");
    }
    setLoading(false);
  }

  function printPage() {
    window.print();
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

  // --- PRINTABLE VIEW ---
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
          <div className="space-y-3 text-base">
            {QUESTIONS.map(q =>
              q.type !== "textarea" ? (
                <div key={q.key} className="flex flex-col gap-1 mb-2">
                  <b>{q.label}</b>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{feedback[q.key]}</span>
                    {q.showStars && (
                      <span className="flex gap-1">
                        {[...Array(STAR_MAPPING[feedback[q.key]] || 1)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div key={q.key} className="mt-2">
                  <b>{q.label}</b>
                  <div className="block mt-1 p-2 bg-blue-50 rounded border min-h-[40px]">{feedback[q.key] || "—"}</div>
                </div>
              )
            )}
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

  // --- FEEDBACK FORM ---
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
        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.key} className={`mb-2 ${q.section && idx > 0 && QUESTIONS[idx - 1].section !== q.section ? "pt-6 border-t" : ""}`}>
              {q.section && (idx === 0 || QUESTIONS[idx - 1].section !== q.section) && (
                <div className="font-bold text-green-700 mb-1 mt-3 text-lg">{q.section}</div>
              )}
              <label className="font-semibold text-gray-800 mb-1 block">{q.label}</label>
              {q.type === "radio" ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {q.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-blue-100 cursor-pointer">
                      <input
                        type="radio"
                        name={q.key}
                        value={opt.value}
                        checked={feedback[q.key] === opt.value}
                        onChange={() => handleChange(q.key, opt.value)}
                        className="accent-blue-600 w-5 h-5"
                        required
                      />
                      <span className="text-base">{opt.label}</span>
                      {q.showStars && (
                        <span className="flex ml-1">
                          {[...Array(STAR_MAPPING[opt.value] || 1)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400" fill={feedback[q.key] === opt.value ? "currentColor" : "none"} />
                          ))}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  name={q.key}
                  rows={3}
                  className="w-full rounded-lg border border-blue-200 p-3 focus:ring-2 focus:ring-blue-400 outline-none mt-2"
                  value={feedback[q.key]}
                  onChange={e => handleChange(q.key, e.target.value)}
                  placeholder="Type your comments..."
                />
              )}
            </div>
          ))}
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
