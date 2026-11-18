import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from "recharts";
import { useAuth } from "../auth";
import { Card, Empty, Page, Spinner, useGet } from "../components/ui";
const COLORS = { matched: "#10b981", partial: "#f59e0b", missing: "#f43f5e" };
export default function Dashboard() {
  const { user } = useAuth(); const [d, err] = useGet("/dashboard/stats");
  if (err) return <p className="text-rose-500">{err}</p>;
  if (!d) return <Spinner />;
  if (d.empty) return <Page title={`Welcome, ${user.name}!`} sub="Upload your resume to see your career-fit insights."><Empty text="No analyses yet." /></Page>;
  const stats = [["Resumes analyzed", d.total], ["Skills detected", d.skills_detected], ["Matched skills", d.counts.matched], ["Missing skills", d.counts.missing], ["Best fit", `${d.best_score}%`]];
  return (
    <Page title={`Welcome back, ${user.name}!`} sub={`Best match: ${d.best_role}`}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(([l, v]) => <Card key={l}><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{v}</p></Card>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title={`Skill gap – ${d.best_role}`}><ResponsiveContainer height={260}><PieChart>
          <Pie data={Object.entries(d.counts).map(([name, value]) => ({ name, value }))} dataKey="value" innerRadius={60} outerRadius={95} label>
            {Object.keys(d.counts).map((k) => <Cell key={k} fill={COLORS[k]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs">{Object.entries(COLORS).map(([k, c]) => <span key={k}><i className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: c }} />{k}</span>)}</div></Card>
        <Card title="Career-fit by role"><ResponsiveContainer height={290}><BarChart data={d.role_scores} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="role" width={120} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="score" fill="#6366f1" radius={6} /></BarChart></ResponsiveContainer></Card>
        <Card title="Career-fit progress"><ResponsiveContainer height={240}><LineChart data={d.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="score" stroke="#8b5cf6" strokeWidth={3} /></LineChart></ResponsiveContainer></Card>
        <Card title="Recent analyses"><ul className="divide-y">{d.recent.map((a) => <li key={a.id} className="py-2 flex justify-between text-sm"><Link className="text-indigo-600" to={`/analysis/${a.id}`}>{a.filename}</Link><span>{a.best_role} · {a.best_score}%</span></li>)}</ul>
          <Link to="/upload" className="inline-block mt-3 text-sm text-indigo-600">+ Quick upload</Link></Card>
      </div>
    </Page>
  );
}
