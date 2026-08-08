import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

import EmployerDashboard from './pages/EmployerDashboard';
import EmployerJobsPage from './pages/EmployerJobsPage';
import JobFormPage from './pages/JobFormPage';
import JobBoardPage from './pages/JobBoardPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import EmployerProfilePage from './pages/EmployerProfilePage';
import { useAuthStore } from './store/useAuthStore';
import JobDetailsPage from './pages/JobDetailsPage';
import CandidateApplicationsPage from './pages/CandidateApplicationsPage';
import CandidateSearchPage from './pages/CandidateSearchPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import AdminEmployersList from './components/admin/AdminEmployersList';
import AdminCandidatesList from './components/admin/AdminCandidatesList';
import AdminDocumentReviews from './components/admin/AdminDocumentReviews';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

// Get Client ID from environment variables (.env file)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

function ProfileRouter() {
  const { user } = useAuthStore();
  if (user?.role === 'EMPLOYER') {
    return <EmployerProfilePage />;
  }
  return <CandidateProfilePage />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <Toaster position="top-right" />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/analytics" element={<EmployerDashboard />} />
              <Route path="/dashboard/jobs" element={<EmployerJobsPage />} />
              <Route path="/dashboard/jobs/new" element={<JobFormPage />} />
              <Route path="/dashboard/jobs/:id/edit" element={<JobFormPage />} />
              <Route path="/dashboard/jobs/:id/board" element={<JobBoardPage />} />
              <Route path="/dashboard/search" element={<CandidateSearchPage />} />
              
              <Route path="/profile" element={<ProfileRouter />} />
              <Route path="/profile/applications" element={<CandidateApplicationsPage />} />
              <Route path="/profile/resume-builder" element={<ResumeBuilderPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="employers" element={<AdminEmployersList />} />
                <Route path="candidates" element={<AdminCandidatesList />} />
                <Route path="reviews" element={<AdminDocumentReviews />} />
              </Route>
            </Route>

            <Route path="*" element={<div className="p-10 text-center">404 Not Found</div>} />
          </Routes>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
