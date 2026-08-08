import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Briefcase, CheckCircle, FileText, User, ChevronRight } from 'lucide-react';
import RecommendedJobs from '../components/candidate/RecommendedJobs';

import EmployerDashboard from './EmployerDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch Candidate Profile to get name and completion score
  const { data: profile, isLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/candidate/profile');
      return response.data;
    },
    enabled: user?.role === 'CANDIDATE', // Only run if user is a candidate
  });

  if (user?.role === 'EMPLOYER') {
    return <EmployerDashboard />;
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Redirecting to Admin Dashboard...</h2>
          <Link to="/admin" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md inline-block">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Candidate Dashboard UI
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar — initials with gradient */}
            <div className="h-20 w-20 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg select-none">
              {isLoading ? (
                <User className="h-10 w-10 text-white opacity-60" />
              ) : (
                <span className="text-2xl font-extrabold text-white tracking-wide">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                    : profile?.firstName
                    ? profile.firstName[0].toUpperCase()
                    : (user?.email?.[0] ?? 'U').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {isLoading ? '...' : (profile?.firstName || user?.email?.split('@')[0])}!
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                Candidate Dashboard
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full sm:w-auto min-w-[200px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Profile Completion</span>
              <span className="text-sm font-bold text-blue-600">{profile?.profileCompletionScore || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${profile?.profileCompletionScore || 0}%` }}
              ></div>
            </div>
            {(profile?.profileCompletionScore || 0) < 100 && (
              <Link to="/profile" className="text-xs text-blue-600 font-medium hover:underline mt-3 inline-flex items-center gap-1">
                Complete your profile <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions & Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Resume</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              {profile?.resumeUrl ? 'Resume uploaded and parsed.' : 'Upload your resume to get AI job matches.'}
            </p>
            <Link to="/profile" className="text-indigo-600 text-sm font-semibold hover:underline">
              {profile?.resumeUrl ? 'Update Resume' : 'Upload Resume'} &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Applications</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Track the status of your recent job applications.
            </p>
            <Link to="/profile/applications" className="text-emerald-600 text-sm font-semibold hover:underline">
              View Applications &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Find Jobs</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">
              Browse jobs tailored to your skills and experience.
            </p>
            <Link to="/" className="text-sky-600 text-sm font-semibold hover:underline">
              Search Jobs &rarr;
            </Link>
          </div>

        </div>

        {/* AI Recommended Jobs */}
        <RecommendedJobs />

      </div>
    </div>
  );
}
