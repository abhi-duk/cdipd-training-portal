import Link from "next/link";
import {
  GaugeCircle, ListChecks, BookOpenCheck, Users, Info, UserCog
} from "lucide-react";
import SidebarUserSection from "@/components/SidebarUserSection"; // <-- Make sure this import path is correct!

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex">
        <aside className="bg-blue-800 text-white w-64 flex flex-col py-8 px-6 min-h-screen shadow-xl">
          <div className="text-2xl font-bold mb-10 tracking-wide flex items-center gap-2">
            <GaugeCircle className="w-7 h-7 text-white/70" /> CDIPD Admin
          </div>
          <nav className="flex-1 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <GaugeCircle className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/admin/trainings" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <BookOpenCheck className="w-5 h-5" /> Trainings
            </Link>
            <Link href="/admin/assignments" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <ListChecks className="w-5 h-5" /> Assignments
            </Link>
            <Link href="/admin/participants" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <Users className="w-5 h-5" /> Participants
            </Link>
            <Link href="/admin/feedbacks" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <Info className="w-5 h-5" /> Feedback Reports
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-900 transition text-lg font-semibold">
              <UserCog className="w-5 h-5" /> Settings
            </Link>
          </nav>
          {/* Sidebar bottom: Avatar/Name and Logout */}
          <SidebarUserSection />
        </aside>
        <main className="flex-1 p-10">{children}</main>
      </body>
    </html>
  );
}
