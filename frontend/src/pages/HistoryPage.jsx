import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { api, errMsg } from "../api";
import { Card, Empty, Page, Spinner, useGet } from "../components/ui";
export default function HistoryPage() {
  const [rows, err, setRows] = useGet("/resumes/history");
  if (err) return <p className="text-rose-500">{err}</p>;
  if (!rows) return <Spinner />;
  const del = async (id) => {
    if (!confirm("Delete this analysis?")) return;
    try { await api.delete(`/resumes/${id}`); setRows(rows.filter((r) => r.id !== id)); toast.success("Deleted"); } catch (e) { toast.error(errMsg(e)); }
  };
  if (!rows.length) return <Page title="Analysis History"><Empty text="No analyses yet." /></Page>;
  return (
    <Page title="Analysis History"><Card><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th>File</th><th>Date</th><th>Best role</th><th>Fit</th><th /></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id} className="border-t"><td className="py-2"><Link className="text-indigo-600" to={`/analysis/${r.id}`}>{r.filename}</Link></td>
        <td>{new Date(r.created_at).toLocaleDateString()}</td><td>{r.best_role}</td><td>{r.best_score}%</td>
        <td><button onClick={() => del(r.id)} className="text-rose-500"><Trash2 size={16} /></button></td></tr>)}</tbody></table></Card></Page>
  );
}
