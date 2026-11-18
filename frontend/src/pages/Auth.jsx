import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../auth";
import { errMsg } from "../api";

const strength = (p) => [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
export default function Auth({ mode }) {
  const signup = mode === "signup"; const { login, signup: doSignup } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", terms: false, remember: true });
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [errs, setErrs] = useState({});
  const set = (k) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((prev) => ({ ...prev, [k]: value }));
  };
  const validate = () => {
    const e = {};
    const email = f.email.trim();
    if (signup && (f.name.trim().length < 2 || f.name.trim().length > 80)) e.name = "Enter a name between 2 and 80 characters";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (f.password.length < 8) e.password = "At least 8 characters";
    if (f.password.length > 128) e.password = "Password must be 128 characters or fewer";
    if (signup && f.password !== f.confirm) e.confirm = "Passwords do not match";
    if (signup && !f.terms) e.terms = "Accept the terms to continue";
    setErrs(e); return !Object.keys(e).length;
  };
  const submit = async (ev) => {
    ev.preventDefault(); if (!validate()) return; setBusy(true);
    try {
      signup
        ? await doSignup({ name: f.name.trim(), email: f.email.trim().toLowerCase(), password: f.password })
        : await login({ email: f.email.trim().toLowerCase(), password: f.password });
      toast.success(signup ? "Account created!" : "Welcome back!"); nav("/dashboard");
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const field = (k, label, type = "text") => (
    <div><label htmlFor={`auth-${k}`} className="text-sm text-slate-600">{label}</label>
      <div className="relative"><input id={`auth-${k}`} name={k} type={type === "password" && show ? "text" : type}
        autoComplete={k === "name" ? "name" : k === "email" ? "email" : signup ? "new-password" : "current-password"}
        maxLength={k === "name" ? 80 : k === "password" || k === "confirm" ? 128 : undefined}
        aria-invalid={Boolean(errs[k])} aria-describedby={errs[k] ? `auth-${k}-error` : undefined}
        value={f[k]} onChange={set(k)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {k === "password" && <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-3 top-4 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
      </div>{errs[k] && <p id={`auth-${k}-error`} className="text-xs text-rose-500 mt-1">{errs[k]}</p>}</div>
  );
  const s = strength(f.password);
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 via-white to-purple-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-4">
        <div className="text-center"><Sparkles className="mx-auto text-purple-600" />
          <h1 className="text-2xl font-bold mt-2">{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="text-slate-500 text-sm">CareerAI – Resume Gap Analyzer & Career Advisor</p></div>
        {signup && field("name", "Full name")}
        {field("email", "Email address", "email")}
        {field("password", "Password", "password")}
        {signup && <>
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded ${i < s ? ["bg-rose-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"][s - 1] : "bg-slate-200"}`} />)}</div>
          {field("confirm", "Confirm password", "password")}
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={f.terms} onChange={set("terms")} />I accept the terms and conditions</label>
          {errs.terms && <p className="text-xs text-rose-500">{errs.terms}</p>}</>}
        {!signup && <label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" checked={f.remember} onChange={set("remember")} />Remember me</label>}
        <button disabled={busy} className="w-full py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-60">{busy ? "Please wait…" : signup ? "Create Account" : "Login"}</button>
        <p className="text-center text-sm text-slate-500">{signup ? "Already have an account? " : "New here? "}<Link className="text-indigo-600 font-medium" to={signup ? "/login" : "/signup"}>{signup ? "Login" : "Sign up"}</Link></p>
      </form>
    </div>
  );
}
