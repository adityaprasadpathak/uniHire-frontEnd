import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import apiClient from '../services/apiClient';

import ResumeUploader from '../components/candidate/ResumeUploader';
import BasicInfoForm from '../components/candidate/BasicInfoForm';
import ExperienceList from '../components/candidate/ExperienceList';
import EducationList from '../components/candidate/EducationList';
import DocumentUploader from '../components/candidate/DocumentUploader';

export default function CandidateProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/profile');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-500">Manage your resume and professional details.</p>
        </div>

        <ResumeUploader 
          currentResumeUrl={profile?.resumeUrl} 
          parsingStatus={profile?.parsingStatus} 
        />
        
        <BasicInfoForm initialData={profile} />
        
        <DocumentUploader />

        <ExperienceList experiences={profile?.experiences || []} />
        
        <EducationList educations={profile?.educations || []} />

      </div>
    </div>
  );
}
