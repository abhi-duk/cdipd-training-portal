"use client";
import { useEffect, useState } from "react";
import { ListChecks, Download, CheckCircle2, Ban, MailCheck } from "lucide-react";
import * as XLSX from "xlsx";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then(r => r.json())
      .then(d => {
        setAssignments(d.assignments || []);
        setLoading(false);
      });
  }, []);

  function downloadExcel() {
    const rows = assignments.map((a, i) => ({
      "Sl. No": i + 1,
      Name: a.participant.name,
      Email: a.participant.email,
      "Training Topic": a.training.topic,
      "Training Date": new Date(a.training.date).toLocaleDateString(),
      Trainer: a.training.trainer,
      Status: a.participant.isActive ? "Active" : "Inactive",
      "Feedback Submitted": a.feedback ? "Yes" : "No"
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AllAssignments");
    XLSX.writeFile(wb, `All_Training_Assignments.xlsx`);
    toast.success("Downloaded Excel!");
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <ListChecks className="w-7 h-7 text-blue-700" />
        All Training Assignments
      </h2>
      <button
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition mb-4"
        onClick={downloadExcel}
      >
        <Download className="w-5 h-5" /> Download Excel
      </button>
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="py-3 px-4">Sl. No</th>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Training</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Trainer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Feedback</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">
                  No assignments found.
                </td>
              </tr>
            )}
            {!loading && assignments.map((a, i) => (
              <tr key={a.id}>
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{a.participant.name}</td>
                <td className="py-2 px-4">{a.participant.email}</td>
                <td className="py-2 px-4">{a.training.topic}</td>
                <td className="py-2 px-4">{new Date(a.training.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{a.training.trainer}</td>
                <td className="py-2 px-4">
                  {a.participant.isActive ? (
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
                    <span className="text-gray-400 font-semibold">Pending</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <Link href={`/admin/participants/${a.participant.id}/trainings`}>
                    <span className="text-blue-700 underline">View</span>
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
