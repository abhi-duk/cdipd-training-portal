"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle, BookOpenCheck, Users, CheckCircle2, Ban, Pencil, Power, Loader2, Save, XCircle
} from "lucide-react";
import toast from "react-hot-toast";

type Training = {
  id: number;
  topic: string;
  date: string;
  trainer: string;
  isActive: boolean;
};

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ topic: "", date: "", trainer: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  function loadTrainings() {
    setLoading(true);
    fetch("/api/trainings")
      .then(r => r.json())
      .then(d => {
        setTrainings(d.trainings || []);
        setLoading(false);
      });
  }

  // --- Open Add/Edit Modal ---
  function openModal(training?: Training) {
    if (training) {
      setEditId(training.id);
      setForm({
        topic: training.topic,
        date: training.date?.slice(0, 10),
        trainer: training.trainer,
      });
    } else {
      setEditId(null);
      setForm({ topic: "", date: "", trainer: "" });
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm({ topic: "", date: "", trainer: "" });
  }

  // --- Add/Edit Handler ---
  async function saveTraining(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PATCH" : "POST";
    const body = editId
      ? { id: editId, ...form }
      : form;
    const res = await fetch("/api/trainings", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editId ? "Training updated!" : "Training added!");
      closeModal();
      loadTrainings();
    } else {
      toast.error("Error saving training");
    }
  }

  // --- Activate/Deactivate Handler ---
  async function toggleActive(id: number, current: boolean) {
    setSaving(true);
    const res = await fetch("/api/trainings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(!current ? "Training activated" : "Training deactivated");
      loadTrainings();
    } else {
      toast.error("Error updating status");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-blue-900">
          <BookOpenCheck className="w-8 h-8 text-blue-700" /> Trainings
        </h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow font-bold text-lg"
          onClick={() => openModal()}
        >
          <PlusCircle className="w-6 h-6" /> Add Training
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Trainer</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
              <th className="py-3 px-4">Open</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td>
              </tr>
            )}
            {!loading && trainings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No trainings yet.</td>
              </tr>
            )}
            {!loading && trainings.map((t, i) => (
              <tr key={t.id} className="hover:bg-blue-50">
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4 font-semibold">{t.topic}</td>
                <td className="py-2 px-4">{new Date(t.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{t.trainer}</td>
                <td className="py-2 px-4">
                  {t.isActive ? (
                    <span className="flex items-center gap-1 text-green-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                      <Ban className="w-4 h-4" /> Inactive
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 flex items-center gap-2">
                  <button
                    className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
                    onClick={() => openModal(t)}
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    className={
                      t.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                        : "bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
                    }
                    disabled={saving}
                    onClick={() => toggleActive(t.id, t.isActive)}
                  >
                    <Power className="w-4 h-4" />
                    {t.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
                <td className="py-2 px-4">
                  <Link href={`/admin/trainings/${t.id}`}>
                    <span className="text-blue-700 underline flex items-center gap-1">
                      <Users className="w-4 h-4" /> View
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <form
            onSubmit={saveTraining}
            className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] w-full max-w-md flex flex-col gap-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{editId ? "Edit Training" : "Add Training"}</h3>
              <button type="button" onClick={closeModal}>
                <XCircle className="w-6 h-6 text-gray-500 hover:text-red-600" />
              </button>
            </div>
            <label className="font-semibold">Training Topic</label>
            <input
              className="p-2 border rounded"
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              required
            />
            <label className="font-semibold">Date</label>
            <input
              type="date"
              className="p-2 border rounded"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
            <label className="font-semibold">Trainer</label>
            <input
              className="p-2 border rounded"
              value={form.trainer}
              onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))}
              required
            />
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold justify-center"
              type="submit"
              disabled={saving}
            >
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              <Save className="w-5 h-5" /> {editId ? "Save Changes" : "Add Training"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
