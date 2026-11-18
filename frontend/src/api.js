import axios from "axios";
export const api = axios.create({ baseURL: "/api", withCredentials: true });
export const errMsg = (e) => {
  const d = e.response?.data?.detail;
  return Array.isArray(d) ? d.map((x) => x.msg).join(", ") : d || "Something went wrong";
};
