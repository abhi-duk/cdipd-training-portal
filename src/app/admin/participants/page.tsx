"use client";
import { useState, useRef, useEffect } from "react";
import {
  Upload, UserPlus, Loader2, Edit, XCircle, ToggleLeft, ToggleRight, CheckCircle2, Ban, GraduationCap, Search
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";


type Participant = {
  id: number;
  name: string;
  email: string;
  designation?: string;
  dept?: string;
  isActive: boolean;
  createdAt?: string;
};

type Training = {
  id: number;
  topic: string;
  date: string;
  trainer: string;
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [form, setForm] = useState({ name: "", email: "", designation: "", dept: "" });
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Participant | null>(null);
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignTrainingId, setAssignTrainingId] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function fetchParticipants() {
    const res = await fetch("/api/participants");
    if (res.ok) {
      const { participants } = await res.json();
      setParticipants(participants);
    }
  }
  
  useEffect(() => { fetchParticipants(); }, []);

async function handleAdd(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  const res = await fetch("/api/participants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  setLoading(false);
  if (res.ok) {
    setForm({ name: "", email: "", designation: "", dept: "" });
    fetchParticipants();
    toast.success("Participant added!");
  } else {
    const error = await res.json();
    if (error.error === "Email already exists") {
      toast.error("Email already exists. Participant not added.");
    } else {
      toast.error("Error adding participant.");
    }
  }
}


  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
    const [headers, ...rows] = json;
    const participantsBulk = rows.map((row) => ({
      name: row[0]?.toString() || "",
      email: row[1]?.toString() || "",
      designation: row[2]?.toString() || "",
      dept: row[3]?.toString() || "",
    }));
    setLoading(true);
    const res = await fetch("/api/participants/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants: participantsBulk }),
    });
    setLoading(false);
    if (res.ok) {
  fetchParticipants();
  toast.success("Bulk upload successful!");
} else {
  const error = await res.json();
  toast.error(error.error || "Bulk upload failed.");
}
  }

  // Edit modal handlers
  function openEditModal(participant: Participant) {
    setEditForm(participant);
    setEditModal(true);
  }
  function closeEditModal() {
    setEditForm(null);
    setEditModal(false);
  }
async function handleEdit(e: React.FormEvent) {
  e.preventDefault();
  if (!editForm) return;
  setLoading(true);
  const res = await fetch("/api/participants", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: editForm.id,
      name: editForm.name,
      email: editForm.email,
      designation: editForm.designation || "",
      dept: editForm.dept || "",
      isActive: editForm.isActive,
    }),
  });
  setLoading(false);
  closeEditModal();
  fetchParticipants();
  if (res.ok) {
    toast.success("Participant updated!");
  } else {
    toast.error("Edit failed.");
  }
}

  // Toggle active/inactive
 async function handleToggleActive(p: Participant) {
  setLoading(true);
  const res = await fetch("/api/participants", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: p.id,
      name: p.name,
      email: p.email,
      designation: p.designation || "",
      dept: p.dept || "",
      isActive: !p.isActive,
    }),
  });
  setLoading(false);
  fetchParticipants();
  if (res.ok) {
    toast.success(
      !p.isActive ? "Participant activated!" : "Participant inactivated!"
    );
  } else {
    toast.error("Status change failed.");
  }
}


  // Assign to training modal
  async function openAssignModal(participant: Participant) {
    setSelectedParticipant(participant);
    setAssignModal(true);
    setAssignLoading(true);
    const res = await fetch("/api/trainings?activeOnly=1");
    const data = await res.json();
    setTrainings(data.trainings || []);
    setAssignLoading(false);
    setAssignTrainingId(null);
  }
  function closeAssignModal() {
    setSelectedParticipant(null);
    setAssignModal(false);
    setAssignTrainingId(null);
  }
  async function handleAssignToTrainingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedParticipant || !assignTrainingId) return;
    setAssignLoading(true);
    const res = await fetch("/api/training-participant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: selectedParticipant.id,
        trainingId: assignTrainingId,
      }),
    });
    setAssignLoading(false);
   if (res.ok) {
  closeAssignModal();
  toast.success("Participant assigned to training!");
} else {
  const error = await res.json();
  toast.error(error.error || "Assignment failed.");
}
  }

  // Search filter logic (by name, email, dept, designation)
  const filteredParticipants = participants.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      (p.dept?.toLowerCase().includes(s) ?? false) ||
      (p.designation?.toLowerCase().includes(s) ?? false)
    );
  });

const activeParticipants = filteredParticipants
  .filter((p) => p.isActive)
  .sort((a, b) => a.name.localeCompare(b.name)); // sort by name

const inactiveParticipants = filteredParticipants
  .filter((p) => !p.isActive)
  .sort((a, b) => a.name.localeCompare(b.name)); // sort by name


  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-green-700" />
          Add Participants
        </h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              className="p-2 border rounded w-56 pl-9"
              placeholder="Search participant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
          >
            <Upload className="w-5 h-5" /> Upload Excel
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFile}
            />
          </button>
        </div>
      </div>

      {/* Add single participant */}
      <form className="flex flex-col md:flex-row gap-4 mb-8 items-end" onSubmit={handleAdd}>
        <input className="p-2 border rounded w-full md:w-1/4" placeholder="Name" value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="p-2 border rounded w-full md:w-1/4" placeholder="Email" type="email" value={form.email} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <input className="p-2 border rounded w-full md:w-1/4" placeholder="Designation" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
        <input className="p-2 border rounded w-full md:w-1/4" placeholder="Department" value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} />
        <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Add
        </button>
      </form>

      {/* Active Participants Table */}
      <h3 className="mt-10 mb-2 text-lg font-bold text-green-800 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" /> Active Participants ({activeParticipants.length})
      </h3>
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto mb-10">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-green-100 text-green-900">
              <th className="py-3 px-4">Sl. No</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Actions</th>
              <th className="py-3 px-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {activeParticipants.map((p, i) => (
              <tr key={p.id} className="odd:bg-green-50">
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.email}</td>
                <td className="py-2 px-4">{p.designation}</td>
                <td className="py-2 px-4">{p.dept}</td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold"
                    onClick={() => openEditModal(p)}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                    onClick={() => handleToggleActive(p)}
                  >
                    <ToggleLeft className="w-4 h-4" /> Inactivate
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 font-semibold"
                    onClick={() => openAssignModal(p)}
                  >
                    <GraduationCap className="w-4 h-4" /> Assign
                  </button>
                </td>
                <td className="py-2 px-4">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</td>
              </tr>
            ))}
            {activeParticipants.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No active participants.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inactive Participants Table */}
      <h3 className="mb-2 text-lg font-bold text-red-700 flex items-center gap-2">
        <Ban className="w-5 h-5" /> Inactive Participants ({inactiveParticipants.length})
      </h3>
      <div className="bg-red-50 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-red-200 text-red-900">
              <th className="py-3 px-4">Sl. No</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Actions</th>
              <th className="py-3 px-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {inactiveParticipants.map((p, i) => (
              <tr key={p.id} className="odd:bg-red-100">
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.email}</td>
                <td className="py-2 px-4">{p.designation}</td>
                <td className="py-2 px-4">{p.dept}</td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                    onClick={() => handleToggleActive(p)}
                  >
                    <ToggleRight className="w-4 h-4" /> Activate
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold"
                    onClick={() => openEditModal(p)}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 font-semibold"
                    onClick={() => openAssignModal(p)}
                  >
                    <GraduationCap className="w-4 h-4" /> Assign
                  </button>
                </td>
                <td className="py-2 px-4">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</td>
              </tr>
            ))}
            {inactiveParticipants.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No inactive participants.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editModal && editForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
            <button className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500" onClick={closeEditModal}>
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Participant
            </h3>
            <form className="space-y-4" onSubmit={handleEdit}>
              <input name="name" type="text" placeholder="Name" className="w-full p-2 border rounded" value={editForm.name} onChange={e => setEditForm(f => ({ ...f!, name: e.target.value }))} required />
              <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" value={editForm.email} onChange={e => setEditForm(f => ({ ...f!, email: e.target.value }))} required />
              <input name="designation" type="text" placeholder="Designation" className="w-full p-2 border rounded" value={editForm.designation || ""} onChange={e => setEditForm(f => ({ ...f!, designation: e.target.value }))} />
              <input name="dept" type="text" placeholder="Department" className="w-full p-2 border rounded" value={editForm.dept || ""} onChange={e => setEditForm(f => ({ ...f!, dept: e.target.value }))} />
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded font-bold hover:bg-blue-800 mt-2 flex justify-center items-center gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignModal && selectedParticipant && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
            <button className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500" onClick={closeAssignModal}>
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Assign Training to {selectedParticipant.name}
            </h3>
            <form className="space-y-4" onSubmit={handleAssignToTrainingSubmit}>
              <select
                className="w-full p-2 border rounded"
                value={assignTrainingId ?? ""}
                required
                onChange={e => setAssignTrainingId(Number(e.target.value))}
                disabled={assignLoading}
              >
                <option value="" disabled>Select training...</option>
                {trainings.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.topic} — {new Date(t.date).toLocaleDateString()} (Trainer: {t.trainer})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-violet-700 text-white py-2 rounded font-bold hover:bg-violet-800 mt-2 flex justify-center items-center gap-2"
                disabled={assignLoading}
              >
                {assignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
