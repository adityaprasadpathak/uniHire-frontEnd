import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Calendar, Clock, MessageCircle, Loader2, Zap } from 'lucide-react';
import apiClient from '../services/apiClient';
import ChatDrawer from '../components/chat/ChatDrawer';
import { Link } from 'react-router-dom';

export default function CandidateApplicationsPage() {
  const [chatAppId, setChatAppId] = useState<number | null>(null);
  const [chatPartyName, setChatPartyName] = useState('');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/applications');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-500">Track your job applications and communicate with employers.</p>
        </div>

        {(!applications || applications.length === 0) ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-6">You haven't applied to any jobs yet.</p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:border-blue-200 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{app.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {app.companyName || 'Company'}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {app.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Status: <strong className="text-slate-700">{app.status.replace('_', ' ')}</strong></span>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    <button 
                      onClick={() => {
                        setChatAppId(app.id);
                        setChatPartyName(app.companyName || 'Employer');
                      }}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors mt-1 md:mt-0"
                    >
                      <MessageCircle className="w-4 h-4" /> Message Employer
                    </button>
                  </div>
                </div>

                {app.aiMatchScore != null && (
                  <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-lg flex items-start gap-2 text-xs">
                    <Zap className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-violet-900">AI Match Score: {app.aiMatchScore}%</span>
                      {app.aiFitAnalysis && <p className="text-violet-700 mt-0.5 leading-relaxed">{app.aiFitAnalysis}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
      
      {chatAppId && (
        <ChatDrawer 
          applicationId={chatAppId} 
          isOpen={true} 
          onClose={() => setChatAppId(null)} 
          otherPartyName={chatPartyName}
        />
      )}
    </div>
  );
}
