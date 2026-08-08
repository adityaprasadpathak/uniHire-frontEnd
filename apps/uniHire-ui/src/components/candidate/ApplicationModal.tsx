import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../services/apiClient';

interface ApplicationModalProps {
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({ jobId, onClose, onSuccess }: ApplicationModalProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const { register, handleSubmit, setValue } = useForm<{ coverLetter: string }>();

  const handleGenerateAiCoverLetter = async () => {
    setIsGeneratingAi(true);
    try {
      const { data } = await apiClient.get('/candidate/ai/cover-letter', { params: { jobId } });
      if (data?.coverLetter) {
        setValue('coverLetter', data.coverLetter);
        toast.success("AI Cover Letter generated!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate AI cover letter");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const applyMutation = useMutation({
    mutationFn: async (data: { coverLetter: string }) => {
      const response = await apiClient.post(`/candidate/jobs/${jobId}/apply`, data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success("Application Submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['publicJob', jobId] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to apply for job');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Apply for Job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-slate-500 mt-2">The employer will review your profile shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => applyMutation.mutate(d))}>
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-4">
                  Your candidate profile and resume will be automatically attached to this application.
                </p>
                
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Cover Letter (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiCoverLetter}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 border border-violet-200"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Generate with AI
                      </>
                    )}
                  </button>
                </div>

                <textarea 
                  {...register('coverLetter')}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit (or click 'Generate with AI')..."
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
