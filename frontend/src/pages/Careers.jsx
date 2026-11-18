import { Link, useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Empty, Page, Spinner, Tag, useGet } from "../components/ui";
export default function Careers() {
  const { id } = useParams(); const [list, err] = useGet(`/analysis/${id}/career-matches`);
  if (err) return <Empty text={err} />;
  if (!list) return <Spinner />;
  return (
    <Page title="Career Recommendations" sub={`Best match: ${list[0].role} (${list[0].score}%)`}>
      <Card title="Career-fit comparison"><ResponsiveContainer height={320}><BarChart data={list} layout="vertical" margin={{ left: 40 }}>
        <XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="role" width={130} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="score" fill="#6366f1" radius={6} /></BarChart></ResponsiveContainer></Card>
      <div className="grid md:grid-cols-2 gap-5">{list.map((c) => (
        <Card key={c.role}><div className="flex justify-between"><h3 className="font-semibold">{c.role}</h3><span className="text-indigo-600 font-bold">{c.score}%</span></div>
          <div className="h-2 bg-slate-100 rounded my-2"><div className="h-2 rounded bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${c.score}%` }} /></div>
          <p className="text-xs text-slate-500 mt-2">Matched</p>{c.items.filter((i) => i.status === "matched").map((i) => <Tag key={i.skill} color="green">{i.skill}</Tag>)}
          <p className="text-xs text-slate-500 mt-2">Missing</p>{c.items.filter((i) => i.status === "missing").map((i) => <Tag key={i.skill} color="red">{i.skill}</Tag>)}
          <Link to={`/skill-gap/${id}`} className="block mt-3 text-sm text-indigo-600">View details →</Link></Card>))}</div>
    </Page>
  );
}
