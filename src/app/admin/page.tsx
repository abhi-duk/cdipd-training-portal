"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GaugeCircle, BookOpenCheck, Users, ListChecks, PieChart, MailWarning
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    trainings: 0,
    activeTrainings: 0,
    participants: 0,
    assignments: 0,
    feedbackSubmitted: 0,
    pendingFeedback: 0,
    topTrainings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3 tracking-wide text-blue-900">
        <GaugeCircle className="w-9 h-9 text-blue-700" />
        Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/admin/trainings" className="group bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl shadow hover:shadow-2xl transition flex flex-col gap-2 border-t-4 border-blue-400 hover:scale-105">
          <BookOpenCheck className="w-8 h-8 text-blue-700 group-hover:scale-110 transition" />
          <div className="text-4xl font-bold text-blue-900">{stats.activeTrainings}</div>
          <div className="font-semibold text-blue-600">Active Trainings</div>
        </Link>
        <Link href="/admin/participants" className="group bg-gradient-to-br from-violet-100 to-violet-50 p-6 rounded-xl shadow hover:shadow-2xl transition flex flex-col gap-2 border-t-4 border-violet-400 hover:scale-105">
          <Users className="w-8 h-8 text-violet-700 group-hover:scale-110 transition" />
          <div className="text-4xl font-bold text-violet-900">{stats.participants}</div>
          <div className="font-semibold text-violet-600">Participants</div>
        </Link>
        <Link href="/admin/assignments" className="group bg-gradient-to-br from-teal-100 to-teal-50 p-6 rounded-xl shadow hover:shadow-2xl transition flex flex-col gap-2 border-t-4 border-teal-400 hover:scale-105">
          <ListChecks className="w-8 h-8 text-teal-700 group-hover:scale-110 transition" />
          <div className="text-4xl font-bold text-teal-900">{stats.assignments}</div>
          <div className="font-semibold text-teal-600">Assignments</div>
        </Link>
        <Link href="/admin/feedbacks" className="group bg-gradient-to-br from-emerald-100 to-emerald-50 p-6 rounded-xl shadow hover:shadow-2xl transition flex flex-col gap-2 border-t-4 border-emerald-400 hover:scale-105">
          <PieChart className="w-8 h-8 text-emerald-700 group-hover:scale-110 transition" />
          <div className="text-4xl font-bold text-emerald-900">{stats.feedbackSubmitted}/{stats.assignments}</div>
          <div className="font-semibold text-emerald-600">Feedback Submitted</div>
        </Link>
      </div>

      {/* Pending Feedbacks Alert */}
      <div className="bg-yellow-50 rounded-xl p-5 mb-10 shadow flex items-center gap-4 border-l-4 border-yellow-400">
        <MailWarning className="w-10 h-10 text-yellow-600 animate-pulse" />
        <span className="text-xl font-semibold text-yellow-700">
          {stats.pendingFeedback} assignments pending feedback
        </span>
      </div>

      {/* Top Trainings Table */}
      <div>
        <div className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2 tracking-wide">
          <BookOpenCheck className="w-7 h-7" /> Top Active Trainings
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl bg-white shadow-lg">
            <thead>
              <tr className="bg-blue-100 text-blue-900 text-lg">
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Trainer</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Feedback %</th>
                <th className="py-3 px-4">Open</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && stats.topTrainings && stats.topTrainings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-gray-400">No active trainings</td>
                </tr>
              )}
              {!loading && stats.topTrainings && stats.topTrainings.map((t: any) => (
                <tr key={t.id} className="hover:bg-blue-50">
                  <td className="py-2 px-4 font-semibold">{t.topic}</td>
                  <td className="py-2 px-4">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{t.trainer}</td>
                  <td className="py-2 px-4">{t.count}</td>
                  <td className="py-2 px-4">
                    <span className="font-semibold text-emerald-700">
                      {t.count > 0 ? Math.round((t.feedbacks / t.count) * 100) : 0}%
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/trainings/${t.id}/feedback`} className="text-blue-700 underline font-semibold hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
