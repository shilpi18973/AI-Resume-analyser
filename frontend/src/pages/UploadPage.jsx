import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, X } from "lucide-react";
import { api, errMsg } from "../api";
import { Card, Page } from "../components/ui";
const MAX = 5 * 1024 * 1024;
export default function UploadPage() {
  const [file, setFile] = useState(null); const [pct, setPct] = useState(0); const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false); const input = useRef(); const nav = useNavigate();
  const pick = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name)) return toast.error("Only PDF or DOCX files are allowed");
    if (f.size > MAX) return toast.error("File must be under 5 MB");
    setFile(f);
  };
  const analyze = async () => {
    const fd = new FormData(); fd.append("file", file); setBusy(true); setPct(0);
    try {
      const { data } = await api.post("/resumes/upload", fd, { onUploadProgress: (e) => setPct(Math.round((e.loaded / (e.total || file.size)) * 100)) });
      toast.success("Analysis complete"); nav(`/analysis/${data.id}`);
    } catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };
  return (
    <Page title="Upload Resume" sub="PDF or DOCX, up to 5 MB">
      <Card>
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center ${drag ? "border-indigo-500 bg-indigo-50" : "border-slate-300"}`}>
          <UploadCloud className="mx-auto text-indigo-500" size={40} />
          <p className="mt-3 text-slate-600">Drag & drop your resume here, or</p>
          <button onClick={() => input.current.click()} className="mt-2 px-4 py-2 rounded-xl border border-indigo-300 text-indigo-600 text-sm">Browse files</button>
          <input ref={input} type="file" hidden accept=".pdf,.docx" onChange={(e) => pick(e.target.files[0])} />
        </div>
        {file && <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
          <span>{file.name} · {(file.size / 1024).toFixed(0)} KB</span>
          {!busy && <button onClick={() => setFile(null)}><X size={16} /></button>}</div>}
        {busy && <div className="mt-4"><div className="h-2 bg-slate-200 rounded"><div className="h-2 rounded bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${pct}%` }} /></div>
          <p className="text-xs text-slate-500 mt-2 animate-pulse">{pct < 100 ? "Uploading…" : "Analyzing with AI… the first run downloads the model and can take a minute"}</p></div>}
        <button disabled={!file || busy} onClick={analyze} className="mt-5 px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50">Analyze Resume</button>
      </Card>
    </Page>
  );
}
