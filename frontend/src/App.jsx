import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import UploadPage from "@/pages/UploadPage";
import AnalyzePage from "@/pages/AnalyzePage";
import JobMatchPage from "@/pages/JobMatchPage";
import RewritePage from "@/pages/RewritePage";
import ChatPage from "@/pages/ChatPage";
import HistoryPage from "@/pages/HistoryPage";
import ProfilePage from "@/pages/ProfilePage";
import RoadmapPage from "@/pages/RoadmapPage";
import InterviewPrepPage from "@/pages/InterviewPrepPage";
import ResumePreviewPage from "@/pages/ResumePreviewPage";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Resume",
  "/analyze": "Analysis",
  "/job-match": "Job Match",
  "/rewrite": "AI Rewriter",
  "/history": "Version History",
  "/chat": "AI Chat",
  "/profile": "My Profile",
  "/roadmap": "Skill Roadmap",
  "/interview-prep": "Interview Prep",
  "/preview": "Web PDF Builder",
};

const AppLayoutWithTitle = () => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "ResumeAI";
  return <AppLayout title={title} />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ResumeProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected app routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayoutWithTitle />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/job-match" element={<JobMatchPage />} />
                <Route path="/rewrite" element={<RewritePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/interview-prep" element={<InterviewPrepPage />} />
                <Route path="/preview" element={<ResumePreviewPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </ResumeProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
