"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Ban, MailCheck, Search, Download, Eye, Info, BadgeCheck
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ... (types same as your original)
type Feedback = {
  id: number;
  tpId: number;
  trainerExplanation: string;
  trainerKnowledge: string;
  trainerEngagement: string;
  trainerAnswering: string;
  contentRelevance: string;
  contentClarity: string;
  contentOrganization: string;
  infrastructureComfort: string;
  seatingArrangement: string;
  venueLocation: string;
  overallSatisfaction: string;
  recommendTraining: boolean;
  additionalComments: string | null;
  submittedAt: string;
};

type FeedbackRow = {
  id: number;
  participant: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    designation?: string;
    dept?: string;
  };
  feedback: Feedback | null;
};

// 👇 Type signature for the page is CRUCIAL! 
export default function AdminTrainingFeedbackPage({
  params,
}: {
  params: { id: string }
}) {
  // ... your component code exactly as before ...
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalFeedback, setModalFeedback] = useState<FeedbackRow | null>(null);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/trainings/${params.id}/feedback`);
      const data = await res.json();
      setRows(data.feedbacks || []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  // Stats
  const submittedCount = rows.filter(r => r.feedback).length;
  const total = rows.length;
  const percent = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  // Excel Export
  function downloadExcel() {
    const exportRows = rows.map((r, i) => ({
      "Sl. No": i + 1,
      Name: r.participant.name,
      Email: r.participant.email,
      Status: r.participant.isActive ? "Active" : "Inactive",
      "Feedback Submitted": r.feedback ? "Yes" : "No",
      ...(r.feedback ? {
        "Overall Satisfaction": r.feedback.overallSatisfaction,
        "Recommend Training": r.feedback.recommendTraining ? "Yes" : "No",
        "Additional Comments": r.feedback.additionalComments || ""
      } : {})
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, `TrainingFeedback_${params.id}.xlsx`);
    toast.success("Downloaded Excel!");
  }

  // Certificate Download per participant
  async function downloadCertificate(participantId: number, trainingId: string) {
    setDownloading(prev => ({ ...prev, [participantId]: true }));
    try {
      const res = await fetch(`/api/certificate?participantId=${participantId}&trainingId=${trainingId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${participantId}_${trainingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Certificate downloaded!");
      } else {
        toast.error("Certificate generation failed!");
      }
    } catch {
      toast.error("Certificate generation failed!");
    } finally {
      setDownloading(prev => ({ ...prev, [participantId]: false }));
    }
  }

  // Pie/bar chart data
  const pieData = [
    { name: "Submitted", value: submittedCount },
    { name: "Pending", value: total - submittedCount }
  ];
  const pieColors = ["#6d28d9", "#c7d2fe"];

  const satisfactionData = Object.entries(rows
    .filter(r => r.feedback)
    .reduce((acc, r) => {
      const key = r.feedback!.overallSatisfaction;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
    .map(([key, value]) => ({ name: key, count: value }));

  // Filtered rows
  const filteredRows = rows.filter(r =>
    !search ||
    r.participant.name.toLowerCase().includes(search.toLowerCase()) ||
    r.participant.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <Info className="w-6 h-6 text-violet-700" />
        Training Feedback Overview
      </h2>
      {/* Analytics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-800 rounded px-3 py-2 font-bold">
            Submitted: {submittedCount}/{total} ({percent}%)
          </span>
          <span className="bg-violet-100 text-violet-800 rounded px-3 py-2 font-bold">
            Pending: {total - submittedCount}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              className="p-2 border rounded w-64 pl-9"
              placeholder="Search participant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            onClick={downloadExcel}
            disabled={rows.length === 0}
          >
            <Download className="w-5 h-5" /> Download Excel
          </button>
        </div>
      </div>
      {/* Charts */}
      {rows.length > 0 && (
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie: Feedback Submission */}
          <div className="bg-violet-50 rounded-lg p-4">
            <h4 className="font-bold mb-2 text-center">Feedback Submission</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%" outerRadius={60} label
                  dataKey="value"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={pieColors[idx]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Bar: Overall Satisfaction */}
          <div className="bg-violet-50 rounded-lg p-4">
            <h4 className="font-bold mb-2 text-center">Overall Satisfaction</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={satisfactionData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6d28d9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-violet-100 text-violet-900">
              <th className="py-3 px-4">Sl. No</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Feedback</th>
              <th className="py-3 px-4">View</th>
              <th className="py-3 px-4">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No participants found.
                </td>
              </tr>
            )}
            {!loading && filteredRows.map((r, i) => (
              <tr key={r.id}>
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{r.participant.name}</td>
                <td className="py-2 px-4">{r.participant.email}</td>
                <td className="py-2 px-4">
                  {r.participant.isActive ? (
                    <span className="flex items-center gap-1 text-green-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                      <Ban className="w-4 h-4" /> Inactive
                    </span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {r.feedback ? (
                    <span className="flex items-center gap-1 text-blue-700 font-semibold">
                      <MailCheck className="w-4 h-4" /> Submitted
                    </span>
                  ) : (
                    <span className="text-gray-400 font-semibold">Pending</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {r.feedback ? (
                    <button
                      className="flex items-center gap-1 text-violet-700 underline"
                      onClick={() => setModalFeedback(r)}
                    >
                      <Eye className="w-5 h-5" /> View
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {r.feedback ? (
                    <button
                      className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded"
                      onClick={() => downloadCertificate(r.participant.id, params.id)}
                      disabled={!!downloading[r.participant.id]}
                    >
                      <BadgeCheck className="w-4 h-4" />
                      {downloading[r.participant.id] ? "Downloading..." : "Certificate"}
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Feedback Modal */}
      {modalFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 relative animate-fade-in">
            <button className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500" onClick={() => setModalFeedback(null)}>
              ×
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Feedback from {modalFeedback.participant.name}
            </h3>
            <div className="space-y-2 text-sm">
              <b>Trainer Explanation:</b> {modalFeedback.feedback?.trainerExplanation}
              <br /><b>Trainer Knowledge:</b> {modalFeedback.feedback?.trainerKnowledge}
              <br /><b>Trainer Engagement:</b> {modalFeedback.feedback?.trainerEngagement}
              <br /><b>Trainer Answering:</b> {modalFeedback.feedback?.trainerAnswering}
              <br /><b>Content Relevance:</b> {modalFeedback.feedback?.contentRelevance}
              <br /><b>Content Clarity:</b> {modalFeedback.feedback?.contentClarity}
              <br /><b>Content Organization:</b> {modalFeedback.feedback?.contentOrganization}
              <br /><b>Infrastructure Comfort:</b> {modalFeedback.feedback?.infrastructureComfort}
              <br /><b>Seating Arrangement:</b> {modalFeedback.feedback?.seatingArrangement}
              <br /><b>Venue Location:</b> {modalFeedback.feedback?.venueLocation}
              <br /><b>Overall Satisfaction:</b> {modalFeedback.feedback?.overallSatisfaction}
              <br /><b>Recommend Training:</b> {modalFeedback.feedback?.recommendTraining ? "Yes" : "No"}
              {modalFeedback.feedback?.additionalComments && (
                <>
                  <br /><b>Additional Comments:</b> {modalFeedback.feedback.additionalComments}
                </>
              )}
              <br /><span className="text-xs text-gray-500">
                Submitted: {modalFeedback.feedback?.submittedAt && new Date(modalFeedback.feedback.submittedAt).toLocaleString()}
              </span>
            </div>
            <button
              className="mt-6 block mx-auto bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-violet-800"
              onClick={() => setModalFeedback(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
