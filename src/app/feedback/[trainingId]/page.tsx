"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, Printer, LogOut, Home, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// ========== Use EXACT CMMI wording and order ==========

const QUESTIONS = [
  {
    key: "trainerExplanation",
    question: "How well did the trainer explain the topics covered?",
    options: ["Excellent", "Good", "Adequate", "Poor"],
  },
  {
    key: "trainerKnowledge",
    question: "Did the trainer demonstrate in-depth knowledge of the subject?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree"],
  },
  {
    key: "trainerEngagement",
    question: "How engaging was the trainer throughout the session?",
    options: ["Very Engaging", "Engaging", "Somewhat Engaging", "Not Engaging"],
  },
  {
    key: "trainerAnswering",
    question: "Was the trainer able to answer questions effectively?",
    options: ["Always", "Most of the time", "Sometimes", "Rarely"],
  },
  {
    key: "contentRelevance",
    question: "How relevant was the training content to your role?",
    options: ["Very Relevant", "Somewhat Relevant", "Neutral", "Not Relevant"],
  },
  {
    key: "contentClarity",
    question: "How would you rate the clarity of the training materials?",
    options: ["Excellent", "Good", "Adequate", "Poor"],
  },
  {
    key: "contentOrganization",
    question: "Was the content organized and easy to follow?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree"],
  },
  {
    key: "infrastructureComfort",
    question: "Were the training facilities comfortable and conducive to learning?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree"],
  },
  {
    key: "seatingArrangement",
    question: "Was the seating arrangement appropriate for the training format?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree"],
  },
  {
    key: "venueLocation",
    question: "Was the location of the training venue convenient?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree"],
  },
  {
    key: "overallSatisfaction",
    question: "How satisfied are you with the training overall?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
  },
];

const RECOMMEND_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const INITIAL_FEEDBACK = QUESTIONS.reduce(
  (acc, q) => ({
    ...acc,
    [q.key]: "",
  }),
  {
    recommendTraining: "",
    additionalComments: "",
  }
);

export default function FeedbackFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ trainingId: string }>();
  const trainingId = params.trainingId;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(INITIAL_FEEDBACK);
  const [submitted, setSubmitted] = useState(false);
  const [training, setTraining] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load data and feedback
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setErrorMsg(null);

      // If not authenticated, redirect to login/home
      if (status === "unauthenticated") {
        router.replace("/");
        return;
      }

      // Get training details
      const tRes = await fetch(`/api/trainings/${trainingId}`);
      if (tRes.ok) setTraining((await tRes.json()).training);

      // Get participantId
      const pRes = await fetch(
        `/api/participants/by-email?email=${encodeURIComponent(
          session?.user?.email || ""
        )}`
      );
      const { participant } = await pRes.json();
      setParticipant(participant);

      if (!participant) {
        setErrorMsg("You are not a registered participant!");
        setLoading(false);
        return;
      }

      // Get feedback for this participant+training
      const fRes = await fetch(
        `/api/feedback/${trainingId}?participantId=${participant.id}`
      );
      if (fRes.ok) {
        const { feedback } = await fRes.json();
        if (feedback) {
          setFeedback(feedback);
          setSubmitted(true);
        }
      }
      setLoading(false);
    }

    if (status === "authenticated" && session?.user?.email) load();
    else if (status === "unauthenticated") router.replace("/");

    return () => {
      ignore = true;
    };
  }, [session?.user?.email, trainingId, status, router]);

  // Prevent flash of content while loading
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-blue-700">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Loading...
      </div>
    );
  }

  // User is not logged in
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") router.replace("/");
    return null;
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
            <div className="font-bold text-green-900 text-lg">
              {session?.user?.name || participant?.name}
            </div>
            <div className="text-sm text-gray-600">
              {session?.user?.email || participant?.email}
            </div>
            <div className="text-sm text-gray-500">
              Designation: {participant?.designation || "--"}
            </div>
            <div className="text-sm text-gray-500">
              Department: {participant?.dept || "--"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0 print:hidden">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-semibold shadow">
              <Home className="w-5 h-5" /> Dashboard
            </button>
          </Link>
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-semibold shadow"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    );
  }

  // --- PRINT VIEW (after submission) ---
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-green-100 p-4 print:bg-white">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 print:shadow-none print:border">
          <UserHeader />
          <div className="flex items-center gap-2 mb-2 mt-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-700">
              Thank you for your feedback!
            </span>
          </div>
          <div className="mb-4 text-gray-700 text-2xl font-semibold">
            <b>Training:</b> {training?.topic}
            <br />
            <span className="text-lg">
              <b>Date of Training:</b>{" "}
              {training?.date
                ? new Date(training.date).toLocaleDateString()
                : ""}
              <br />
              <b>Trainer Name:</b> {training?.trainer}
            </span>
          </div>
          <hr className="my-2" />
          <div className="space-y-5">
            {QUESTIONS.map((q) => (
              <div
                key={q.key}
                className="bg-blue-50 rounded-lg p-3 flex flex-col"
              >
                <div className="font-medium">{q.question}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-bold text-blue-900 text-base">
                    {feedback[q.key] || <span className="text-gray-400">Not answered</span>}
                  </span>
                  {feedback[q.key] && (
                    <StarRating
                      options={q.options}
                      selected={feedback[q.key]}
                      className="ml-1"
                    />
                  )}
                </div>
              </div>
            ))}
            <div className="bg-blue-50 rounded-lg p-3 flex flex-col">
              <div className="font-medium">
                Would you recommend this training session to others?
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-bold text-blue-900 text-base">
                  {feedback.recommendTraining || <span className="text-gray-400">Not answered</span>}
                </span>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">
                Additional comments/ suggestions
              </div>
              <div className="bg-white rounded-lg border p-3 min-h-[40px]">
                {feedback.additionalComments || "—"}
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 print:hidden"
            >
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

  // --- FORM (if not yet submitted) ---
  function handleChange(field: string, value: string) {
    setFeedback((prev: any) => ({ ...prev, [field]: value }));
  }
  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFeedback((prev: any) => ({ ...prev, [name]: value }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const pRes = await fetch(
      `/api/participants/by-email?email=${encodeURIComponent(session?.user?.email || "")}`
    );
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
      setLoading(false);
      return;
    }
    if (postRes.ok) {
      toast.success("Feedback submitted!");
      setSubmitted(true);
    } else {
      let err = { error: "Could not submit feedback" };
      try {
        err = await postRes.json();
      } catch (_) {}
      setErrorMsg(err?.error || "Could not submit feedback");
      toast.error(err?.error || "Could not submit feedback");
    }
    setLoading(false);
  }

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
          {training?.topic && (
            <>
              {training.topic}
              <span className="font-normal text-gray-600">
                {" "}
                | Trainer: {training.trainer} | Date:{" "}
                {training.date
                  ? new Date(training.date).toLocaleDateString()
                  : ""}
              </span>
            </>
          )}
        </div>
        {errorMsg && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4">
            {errorMsg}
          </div>
        )}
        {/* Sectioned questions */}
        <div className="space-y-6">
          {QUESTIONS.map((q, qIdx) => (
            <div key={q.key} className="bg-blue-50 rounded-lg p-3">
              <div className="font-semibold text-green-900 mb-2">{q.question}</div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((option, idx) => (
                  <label
                    key={option}
                    className={`cursor-pointer rounded-lg border-2 px-3 py-2 flex items-center gap-2 transition
                      ${
                        feedback[q.key] === option
                          ? "border-green-600 bg-green-50 font-semibold"
                          : "border-blue-200 bg-white hover:border-green-400"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={q.key}
                      value={option}
                      checked={feedback[q.key] === option}
                      onChange={() => handleChange(q.key, option)}
                      className="sr-only"
                    />
                    <span>{option}</span>
                    <StarRating
                      options={q.options}
                      selected={option}
                      className="ml-1"
                    />
                  </label>
                ))}
              </div>
              {/* Show selected label and stars below question */}
              {feedback[q.key] && (
                <div className="mt-2 flex items-center gap-2 text-blue-900">
                  <span className="font-bold">{feedback[q.key]}</span>
                  <StarRating
                    options={q.options}
                    selected={feedback[q.key]}
                    className="ml-1"
                  />
                </div>
              )}
            </div>
          ))}
          {/* Recommend training */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-green-900 mb-2">
              Would you recommend this training session to others?
            </div>
            <div className="flex gap-4">
              {RECOMMEND_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`cursor-pointer rounded-lg border-2 px-3 py-2 flex items-center gap-2 transition
                    ${
                      feedback.recommendTraining === o.value
                        ? "border-green-600 bg-green-50 font-semibold"
                        : "border-blue-200 bg-white hover:border-green-400"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="recommendTraining"
                    value={o.value}
                    checked={feedback.recommendTraining === o.value}
                    onChange={handleInput}
                    className="sr-only"
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Additional comments */}
          <div className="bg-blue-50 rounded-lg p-3">
            <label
              className="font-semibold text-green-900 mb-2 block"
              htmlFor="additionalComments"
            >
              Additional comments/ suggestions
            </label>
            <textarea
              id="additionalComments"
              name="additionalComments"
              rows={3}
              className="w-full rounded-lg border border-blue-200 p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              value={feedback.additionalComments}
              onChange={handleInput}
              placeholder="Any suggestions or thoughts..."
            />
          </div>
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

// --- Helper: Star display based on selected option ---
function StarRating({
  options,
  selected,
  className = "",
}: {
  options: string[];
  selected: string;
  className?: string;
}) {
  // Left-most option = max stars
  const idx = options.findIndex((opt) => opt === selected);
  if (idx === -1) return null;
  // Stars: options.length down to 1
  return (
    <span className={"inline-flex gap-0.5 " + className}>
      {options.map((_, i) => (
        <Star
          key={i}
          className={
            "w-4 h-4 " +
            (i <= idx
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300")
          }
        />
      ))}
    </span>
  );
}
