import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/auth/me").then((r) => setUser(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const login = async (b) => setUser((await api.post("/auth/login", b)).data);
  const signup = async (b) => setUser((await api.post("/auth/signup", b)).data);
  const logout = async () => { await api.post("/auth/logout"); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>;
}