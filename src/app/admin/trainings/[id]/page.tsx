"use client";
import { useEffect, useState, useRef } from "react";
import {
  UserPlus, Loader2, XCircle, Trash2, PlusCircle, CheckCircle2, Ban, MailCheck, Search, Download
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

type Participant = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  designation?: string;
  dept?: string;
};

type Assignment = {
  id: number;
  participant: Participant;
  feedback: { id: number } | null;
};

type Training = {
  id: number;
  topic: string;
  date: string;
  trainer: string;
};

export default function TrainingAssignmentsPage({ params }: { params: { id: string } }) {
  const [training, setTraining] = useState<Training | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch training details
  useEffect(() => {
    fetch(`/api/trainings/${params.id}`)
      .then(r => r.json())
      .then(d => setTraining(d.training));
  }, [params.id]);

  // Fetch assignments for this training
  async function fetchAssignments() {
    const res = await fetch(`/api/trainings/${params.id}/assignments`);
    if (res.ok) {
      const { assignments } = await res.json();
      setAssignments(assignments);
    }
  }
  useEffect(() => { fetchAssignments(); }, [params.id]);

  // Fetch participants not yet assigned
  async function fetchUnassigned() {
    const res = await fetch(`/api/trainings/${params.id}/unassigned`);
    if (res.ok) {
      const { participants } = await res.json();
      setParticipants(participants);
    }
  }

  // Remove assignment
  async function handleRemove(participantId: number) {
    setLoading(true);
    const res = await fetch("/api/training-participant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, trainingId: Number(params.id) }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Removed from training");
      fetchAssignments();
      fetchUnassigned();
    } else {
      toast.error("Failed to remove");
    }
  }

  // Open assign modal
  function openAddModal() {
    fetchUnassigned();
    setSelectedIds([]);
    setAddModal(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }
  function closeAddModal() {
    setAddModal(false);
    setSelectedIds([]);
    setParticipants([]);
  }
  function toggleSelect(id: number) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  // Assign selected
  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    for (const pid of selectedIds) {
      await fetch("/api/training-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: pid, trainingId: Number(params.id) }),
      });
    }
    setLoading(false);
    closeAddModal();
    toast.success("Assigned participants!");
    fetchAssignments();
    fetchUnassigned();
  }

  // Search/filter logic
  const filteredAssignments = assignments
    .filter(a =>
      !search ||
      a.participant.name.toLowerCase().includes(search.toLowerCase()) ||
      a.participant.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.participant.name.localeCompare(b.participant.name));

  // ---- Download Excel ----
  function downloadExcel() {
    const rows = filteredAssignments.map((a, idx) => ({
      "Sl. No": idx + 1,
      Name: a.participant.name,
      Email: a.participant.email,
      Status: a.participant.isActive ? "Active" : "Inactive",
      "Feedback Submitted": a.feedback ? "Yes" : "No"
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assignments");
    XLSX.writeFile(wb, `TrainingAssignments_${training?.topic?.replace(/\s+/g, '_') || "training"}.xlsx`);
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <UserPlus className="w-6 h-6 text-violet-600" />
        Training Assignments
      </h2>
      {training && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-8">
          <div className="font-bold text-lg">{training.topic}</div>
          <div className="text-sm text-gray-600">
            <b>Date:</b> {new Date(training.date).toLocaleDateString()} | <b>Trainer:</b> {training.trainer}
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition ml-2"
            onClick={downloadExcel}
          >
            <Download className="w-5 h-5" /> Download Excel
          </button>
        </div>
        <button
          className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-5 py-2 rounded-lg font-semibold shadow transition"
          onClick={openAddModal}
        >
          <PlusCircle className="w-5 h-5" /> Assign Participant
        </button>
      </div>
      {/* Assignment Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-violet-100 text-violet-900">
              <th className="py-3 px-4">Sl. No</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Feedback</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No assigned participants</td>
              </tr>
            )}
            {filteredAssignments.map((a, i) => (
              <tr key={a.id} className={a.participant.isActive ? "odd:bg-violet-50" : "bg-red-50"}>
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{a.participant.name}</td>
                <td className="py-2 px-4">{a.participant.email}</td>
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
                    <span className="flex items-center gap-1 text-violet-700 font-semibold">
                      <MailCheck className="w-4 h-4" /> Submitted
                    </span>
                  ) : (
                    <span className="text-gray-400 font-semibold">Pending</span>
                  )}
                </td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                    onClick={() => handleRemove(a.participant.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add modal */}
      {addModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fade-in">
            <button className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500" onClick={closeAddModal}>
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign Participants
            </h3>
            <form className="space-y-4" onSubmit={handleAssign}>
              <div className="max-h-64 overflow-y-auto">
                {participants.length === 0 && (
                  <div className="text-center text-gray-400 py-8">All active participants assigned</div>
                )}
                {participants.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-violet-50 transition cursor-pointer ${selectedIds.includes(p.id) ? "bg-violet-100 font-semibold" : ""}`}
                  >
                    <input
                      ref={inputRef}
                      type="checkbox"
                      className="accent-violet-600 w-4 h-4"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                    <span>{p.name} <span className="text-gray-500 text-xs">({p.email})</span></span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="w-full bg-violet-700 text-white py-2 rounded font-bold hover:bg-violet-800 mt-2 flex justify-center items-center gap-2"
                disabled={loading || selectedIds.length === 0}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Selected"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
