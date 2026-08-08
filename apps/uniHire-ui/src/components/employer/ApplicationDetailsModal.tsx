import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, User, Mail, Phone, ExternalLink, Calendar, Star, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';
import CandidateProfileModal from './CandidateProfileModal';

interface ApplicationDetailsModalProps {
  applicationId: number;
  onClose: () => void;
}

export default function ApplicationDetailsModal({ applicationId, onClose }: ApplicationDetailsModalProps) {
  const queryClient = useQueryClient();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['applicationDetails', applicationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/employer/applications/${applicationId}`);
      return data;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/employer/applications/${applicationId}/rescore`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationDetails', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">Failed to load application details.</div>
            ) : application ? (
              <div className="space-y-6">
                {/* Candidate Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                        {application.candidateName}
                        {application.candidateVerificationStatus === 'VERIFIED' && (
                          <ShieldCheck className="w-6 h-6 text-green-500 ml-2" title="Verified Candidate" />
                        )}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {application.candidateEmail && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            <span>{application.candidateEmail}</span>
                          </div>
                        )}
                        {application.candidatePhone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span>{application.candidatePhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.candidateId && (
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <User className="w-4 h-4" /> View Full Profile
                    </button>
                  )}
                </div>

                {/* Status & Match Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Current Status</div>
                    <div className="font-semibold text-slate-900 capitalize">{application.status?.replace('_', ' ')}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {application.aiMatchScore != null && (
                    <div className={`p-4 rounded-lg border ${
                      application.aiMatchScore >= 85 ? 'bg-green-50 border-green-200' :
                      application.aiMatchScore >= 70 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Star className="w-4 h-4" /> AI Match Score
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{application.aiMatchScore}%</div>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Cover Letter</h4>
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                {/* AI Fit Analysis */}
                {application.aiFitAnalysis && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      AI Fit Analysis
                    </h4>
                    <div className="bg-blue-50/50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-blue-100 leading-relaxed">
                      {application.aiFitAnalysis}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              {application && !application.aiMatchScore && (
                <button 
                  onClick={() => analyzeMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  Analyze ATS Fit
                </button>
              )}
              {application?.candidateId && (
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <User className="w-4 h-4" /> View Full Candidate Profile
                </button>
              )}
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showProfileModal && application?.candidateId && (
        <CandidateProfileModal
          candidateId={application.candidateId}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}
