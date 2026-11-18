import { useParams } from "react-router-dom";
import { Card, Empty, Page, Spinner, Tag, useGet } from "../components/ui";
const NA = <p className="text-sm text-slate-400 italic">Could not be extracted from this resume</p>;
const List = ({ items }) => items?.length ? <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : NA;
export default function ResumeAnalysis() {
  const { id } = useParams(); const [a, err] = useGet(`/resumes/${id}`);
  if (err) return <Empty text={err} />;
  if (!a) return <Spinner />;
  const e = a.extracted;
  return (
    <Page title="Resume Analysis" sub={`${a.filename} · analyzed ${new Date(a.created_at).toLocaleString()}`}>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Personal information"><p className="text-sm">Name: {e.name || "—"}</p><p className="text-sm">Email: {e.email || "—"}</p><p className="text-sm">Phone: {e.phone || "—"}</p></Card>
        <Card title="Summary">{e.summary ? <p className="text-sm">{e.summary}</p> : NA}</Card>
        <Card title={`Technical skills (${e.skills.length})`}>{e.skills.length ? e.skills.map((s) => <Tag key={s}>{s}</Tag>) : NA}</Card>
        <Card title="Soft skills">{e.soft_skills.length ? e.soft_skills.map((s) => <Tag key={s} color="green">{s}</Tag>) : NA}</Card>
        <Card title="Education"><List items={e.education} /></Card>
        <Card title="Experience"><List items={e.experience} /></Card>
        <Card title="Projects"><List items={e.projects} /></Card>
        <Card title="Certifications"><List items={e.certifications} /></Card>
      </div>
    </Page>
  );
}
