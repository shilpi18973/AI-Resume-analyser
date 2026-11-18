import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Upload, FileText, Target, Briefcase, History, LogOut, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../auth";
const links = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/upload", "Upload Resume", Upload],
  ["/analysis/latest", "Resume Analysis", FileText], ["/skill-gap/latest", "Skill Gap", Target],
  ["/careers/latest", "Career Recommendations", Briefcase], ["/history", "Analysis History", History],
];
export default function Layout() {
  const [open, setOpen] = useState(true); const { user, logout } = useAuth(); const nav = useNavigate();
  return (
    <div className="flex min-h-screen">
      <aside className={`${open ? "w-64" : "w-[72px]"} shrink-0 bg-white border-r border-slate-100 transition-all flex flex-col p-3 sticky top-0 h-screen`}>
        <div className="flex items-center justify-between mb-6 px-2 pt-2">
          {open && <span className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"><Sparkles className="text-purple-600" size={20} />CareerAI</span>}
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-100"><Menu size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} title={label} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon size={18} className="shrink-0" />{open && label}
            </NavLink>))}
        </nav>
        <div className="border-t border-slate-100 pt-3 flex items-center gap-3 px-2">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center font-semibold">{user.name[0].toUpperCase()}</div>
          {open && <p className="text-sm font-medium truncate flex-1">{user.name}</p>}
          <button title="Logout" onClick={async () => { await logout(); nav("/login"); }} className="p-2 rounded-lg hover:bg-slate-100"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 min-w-0"><Outlet /></main>
    </div>
  );
}
