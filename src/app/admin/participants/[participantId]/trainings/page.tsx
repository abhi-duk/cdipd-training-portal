"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Ban, MailCheck, Download } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

type Assignment = {
  id: number;
  training: {
    id: number;
    topic: string;
    date: string;
    trainer: string;
    isActive: boolean;
  };
  feedback: { id: number } | null;
};

type Participant = {
  id: number;
  name: string;
  email: string;
};

export default function ParticipantTrainings({
  params,
}: {
  params: { participantId: string };
}) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/participants/${params.participantId}`),
        fetch(`/api/participants/${params.participantId}/trainings`),
      ]);
      const p = await pRes.json();
      const t = await tRes.json();
      setParticipant(p.participant);
      setAssignments(t.trainings || []);
      setLoading(false);
    }
    load();
  }, [params.participantId]);

  function downloadExcel() {
    const rows = assignments.map((a, i) => ({
      "Sl. No": i + 1,
      "Training Topic": a.training.topic,
      "Date": new Date(a.training.date).toLocaleDateString(),
      "Trainer": a.training.trainer,
      "Status": a.training.isActive ? "Active" : "Inactive",
      "Feedback Submitted": a.feedback ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ParticipantTrainings");
    XLSX.writeFile(
      wb,
      `Trainings_of_${participant?.name?.replace(/\s+/g, "_") || "participant"}.xlsx`
    );
    toast.success("Downloaded Excel!");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <BookOpenCheck className="w-6 h-6 text-violet-700" />
        Trainings for Participant
      </h2>
      {participant && (
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <div>
            <b>Name:</b> {participant.name}
          </div>
          <div>
            <b>Email:</b> {participant.email}
          </div>
        </div>
      )}
      <button
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold mb-4"
        onClick={downloadExcel}
        disabled={assignments.length === 0}
      >
        <Download className="w-5 h-5" /> Download Excel
      </button>
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="py-3 px-4">Training Topic</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Trainer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Feedback</th>
              <th className="py-3 px-4">Open</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Not assigned to any trainings.
                </td>
              </tr>
            )}
            {!loading &&
              assignments.map((a) => (
                <tr key={a.training.id}>
                  <td className="py-2 px-4">{a.training.topic}</td>
                  <td className="py-2 px-4">
                    {new Date(a.training.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{a.training.trainer}</td>
                  <td className="py-2 px-4">
                    {a.training.isActive ? (
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
                    {a.feedback ? (
                      <span className="flex items-center gap-1 text-blue-700 font-semibold">
                        <MailCheck className="w-4 h-4" /> Submitted
                      </span>
                    ) : (
                      <span className="text-gray-400 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/trainings/${a.training.id}`}>
                      <span className="text-blue-700 underline flex items-center gap-1">
                        <BookOpenCheck className="w-4 h-4" /> Open
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
