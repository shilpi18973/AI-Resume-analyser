import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Layout from "./components/Layout";
import { Spinner } from "./components/ui";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import SkillGap from "./pages/SkillGap";
import Careers from "./pages/Careers";
import HistoryPage from "./pages/HistoryPage";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}
export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Auth mode="signup" />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/analysis/:id" element={<ResumeAnalysis />} />
        <Route path="/skill-gap/:id" element={<SkillGap />} />
        <Route path="/careers/:id" element={<Careers />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
