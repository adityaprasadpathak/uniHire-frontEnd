import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface BasicInfoData {
  firstName: string;
  lastName: string;
  phone: string;
  skills: string[];
  languages: string[];
  portfolioUrl: string;
}

interface BasicInfoFormProps {
  initialData?: any;
}

export default function BasicInfoForm({ initialData }: BasicInfoFormProps) {
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<BasicInfoData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      skills: [],
      languages: [],
      portfolioUrl: '',
    }
  });

  const currentSkills = watch('skills') || [];
  const currentLanguages = watch('languages') || [];

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        skills: Array.isArray(initialData.skills) ? initialData.skills : (initialData.skills ? initialData.skills.split(',').map((s: string) => s.trim()) : []),
        languages: initialData.languages ? initialData.languages.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        portfolioUrl: initialData.portfolioUrl || '',
      });
    }
  }, [initialData, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: BasicInfoData) => {
      const payload = {
        ...data,
        languages: data.languages.join(', ')
      };
      await apiClient.put('/candidate/profile', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    }
  });

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !currentSkills.includes(newSkill)) {
        setValue('skills', [...currentSkills, newSkill], { shouldDirty: true });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue('skills', currentSkills.filter(s => s !== skillToRemove), { shouldDirty: true });
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newLang = languageInput.trim();
      if (newLang && !currentLanguages.includes(newLang)) {
        setValue('languages', [...currentLanguages, newLang], { shouldDirty: true });
      }
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setValue('languages', currentLanguages.filter(l => l !== langToRemove), { shouldDirty: true });
  };

  const photoDoc = initialData?.documents?.find((d: any) => d.documentType === 'PHOTO');

  return (
    <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
          {photoDoc ? (
            <img src={photoDoc.url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-sm text-center px-2">No Photo</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Basic Information</h3>
          <p className="text-sm text-slate-500">Update your photo by uploading a 'PHOTO' document below.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <input {...register('firstName')} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input {...register('lastName')} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input {...register('phone')} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio URL</label>
          <input {...register('portfolioUrl')} className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
          <div className="w-full border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {currentSkills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-blue-900 focus:outline-none">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder={currentSkills.length === 0 ? "Type a skill and press Enter or comma" : "Add more skills..."}
              className="w-full outline-none bg-transparent text-sm" 
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Press Enter or comma to add a skill</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Languages</label>
          <div className="w-full border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {currentLanguages.map((lang, index) => (
                <span key={index} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
                  {lang}
                  <button type="button" onClick={() => handleRemoveLanguage(lang)} className="hover:text-indigo-900 focus:outline-none">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={handleAddLanguage}
              placeholder={currentLanguages.length === 0 ? "Type a language and press Enter or comma" : "Add more languages..."}
              className="w-full outline-none bg-transparent text-sm" 
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Press Enter or comma to add a language</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {updateMutation.isPending ? 'Saving...' : 'Save Basic Info'}
        </button>
      </div>
    </form>
  );
}
