import { useState } from "react";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, Empty, Page, Spinner, Tag, useGet } from "../components/ui";
const COL = { matched: "#10b981", partial: "#f59e0b", missing: "#f43f5e" };
const TAG = { matched: "green", partial: "yellow", missing: "red" };
export default function SkillGap() {
  const { id } = useParams(); const [a, err] = useGet(`/resumes/${id}`); const [role, setRole] = useState(null);
  if (err) return <Empty text={err} />;
  if (!a) return <Spinner />;
  const r = role || a.best_role; const m = a.matches[r];
  return (
    <Page title="Skill Gap Analysis" sub="Semantic matching (Sentence-BERT cosine similarity). The score is a heuristic estimate, not a hiring probability.">
      <select value={r} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 bg-white">
        {Object.keys(a.matches).map((k) => <option key={k}>{k}</option>)}</select>
      <div className="grid lg:grid-cols-4 gap-5">
        <Card title="Overall match"><p className="text-4xl font-bold text-indigo-600">{m.score}%</p>
          <p className="text-xs text-slate-500 mt-2">Similarity ≥ 0.80 = full credit, ≥ 0.55 = half, below = none (weighted by skill importance).</p></Card>
        {["matched", "partial", "missing"].map((s) => (
          <Card key={s} title={`${s[0].toUpperCase() + s.slice(1)} (${m.counts[s]})`}>
            {m.items.filter((i) => i.status === s).map((i) => <Tag key={i.skill} color={TAG[s]}>{i.skill}</Tag>)}</Card>))}
      </div>
      <Card title="Skill similarity chart"><ResponsiveContainer height={Math.max(260, m.items.length * 34)}>
        <BarChart data={m.items} layout="vertical" margin={{ left: 40 }}><XAxis type="number" domain={[0, 1]} /><YAxis type="category" dataKey="skill" width={120} />
          <Tooltip /><Bar dataKey="similarity" radius={6}>{m.items.map((i) => <Cell key={i.skill} fill={COL[i.status]} />)}</Bar></BarChart></ResponsiveContainer></Card>
      <Card title="Explanations"><ul className="text-sm space-y-1">{m.items.map((i) => <li key={i.skill}><b>{i.skill}</b> (weight {i.weight}) – {i.status}{i.matched_with ? `, closest resume skill: ${i.matched_with}` : ""} [{i.similarity}]</li>)}</ul></Card>
    </Page>
  );
}
