import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

interface ResumeUploaderProps {
  currentResumeUrl?: string;
  parsingStatus?: string;
}

export default function ResumeUploader({ currentResumeUrl, parsingStatus: initialParsingStatus }: ResumeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');

  // Local state to track polling activation
  const [isPolling, setIsPolling] = useState(initialParsingStatus === 'PENDING');

  const { data: statusData } = useQuery({
    queryKey: ['parsingStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/profile/parsing-status');
      return data;
    },
    enabled: isPolling,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  useEffect(() => {
    if (initialParsingStatus === 'PENDING') {
      setIsPolling(true);
    }
  }, [initialParsingStatus]);

  useEffect(() => {
    if (statusData?.status === 'COMPLETED' || statusData?.status === 'FAILED') {
      setIsPolling(false);
      // If completed, refresh the whole profile to get the parsed data
      if (statusData.status === 'COMPLETED') {
        queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      }
    }
  }, [statusData, queryClient]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post('/candidate/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      setIsPolling(true);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to upload resume. Please try again.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx')) {
      setErrorMsg('Only PDF and DOCX files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be less than 10MB.');
      return;
    }

    uploadMutation.mutate(file);
  };

  const isUploading = uploadMutation.isPending;
  const isCurrentlyPolling = isPolling && statusData?.status !== 'COMPLETED';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Resume</h3>
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {isCurrentlyPolling && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Your resume is being analyzed...</h4>
            <p className="text-sm text-blue-600 mt-1">Our AI is extracting your skills, experience, and education to automatically fill out your profile.</p>
          </div>
        </div>
      )}

      {!isCurrentlyPolling && statusData?.status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 mb-4 text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium text-sm">Resume successfully parsed. Your profile has been updated!</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {currentResumeUrl ? (
          <div className="flex-1 flex items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Current Resume</p>
              <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                View file
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-sm text-slate-500">
            No resume uploaded yet.
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.docx" 
          onChange={handleFileChange}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isCurrentlyPolling}
          className="shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {currentResumeUrl ? 'Update Resume' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
}
