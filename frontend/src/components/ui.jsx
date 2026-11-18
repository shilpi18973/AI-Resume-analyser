import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errMsg } from "../api";
export const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>
    {title && <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>}{children}
  </div>
);
export const Spinner = () => <div className="flex justify-center p-10"><div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" /></div>;
export const Empty = ({ text, to = "/upload", cta = "Upload a resume" }) => (
  <Card className="text-center py-12"><p className="text-slate-500 mb-4">{text}</p>
    <Link to={to} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">{cta}</Link></Card>
);
const C = { green: "bg-emerald-100 text-emerald-700", yellow: "bg-amber-100 text-amber-700", red: "bg-rose-100 text-rose-700", indigo: "bg-indigo-100 text-indigo-700" };
export const Tag = ({ children, color = "indigo" }) => <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mr-1.5 mb-1.5 ${C[color]}`}>{children}</span>;
export function useGet(url) {
  const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { setData(null); setError(null); api.get(url).then((r) => setData(r.data)).catch((e) => setError(errMsg(e))); }, [url]);
  return [data, error, setData];
}
export const Page = ({ title, sub, children }) => (
  <div><h1 className="text-2xl font-bold text-slate-800">{title}</h1>{sub && <p className="text-slate-500">{sub}</p>}<div className="mt-5 space-y-5">{children}</div></div>
);
