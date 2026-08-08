import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { Loader2, Building2, Globe, Mail } from 'lucide-react';

interface EmployerProfileData {
  companyName: string;
  website: string;
  email: string;
}

export default function EmployerProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<EmployerProfileData>({
    queryKey: ['employerProfile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employer/profile');
      return data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<EmployerProfileData>({
    values: profile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { companyName: string; website: string }) => {
      const response = await apiClient.put('/employer/profile', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Employer profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['employerProfile'] });
    },
    onError: () => {
      toast.error('Failed to update employer profile');
    }
  });

  const onSubmit = (data: EmployerProfileData) => {
    updateProfileMutation.mutate({
      companyName: data.companyName,
      website: data.website
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Employer Profile</h1>
          <p className="text-slate-500">Manage your employer and company profile details.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full bg-slate-50 border border-slate-300 rounded-md py-2.5 pl-10 pr-3 text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Contact email linked to your user account (read-only).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register('companyName', { required: 'Company name is required' })}
                type="text"
                className="w-full border border-slate-300 rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Acme Corporation"
              />
            </div>
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Website</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register('website')}
                type="url"
                className="w-full border border-slate-300 rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. https://acme.com"
              />
            </div>
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
