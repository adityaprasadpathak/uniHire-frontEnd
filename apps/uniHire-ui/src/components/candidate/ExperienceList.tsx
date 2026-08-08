import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface ExperienceData {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ExperienceList({ experiences = [] }: { experiences: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ExperienceData>();

  const addMutation = useMutation({
    mutationFn: async (data: ExperienceData) => {
      await apiClient.post('/candidate/profile/experience', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setIsAdding(false);
      reset();
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Experience</h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        )}
      </div>

      <div className="space-y-6">
        {experiences.map((exp: any) => (
          <div key={exp.id} className="flex gap-4">
            <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0 h-10 w-10 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{exp.jobTitle}</h4>
              <p className="text-sm text-slate-600 font-medium">{exp.company}</p>
              <p className="text-xs text-slate-500 mt-1">
                {exp.startDate} - {exp.endDate || 'Present'}
              </p>
              <p className="text-sm text-slate-700 mt-2">{exp.description}</p>
            </div>
          </div>
        ))}

        {experiences.length === 0 && !isAdding && (
          <p className="text-slate-500 text-sm text-center py-4">No experience added yet.</p>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="mt-6 border-t border-slate-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input {...register('jobTitle')} required className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input {...register('company')} required className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date (YYYY-MM)</label>
              <input {...register('startDate')} required className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date (YYYY-MM or empty)</label>
              <input {...register('endDate')} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={addMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Experience
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
