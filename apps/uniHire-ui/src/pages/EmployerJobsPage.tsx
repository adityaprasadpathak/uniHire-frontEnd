import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../services/apiClient';
import React, { useState } from 'react';
import RecommendedCandidates from '../components/employer/RecommendedCandidates';

export default function EmployerJobsPage() {
  const queryClient = useQueryClient();
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const toggleRecommendations = (jobId: number) => {
    setExpandedJobId(prev => prev === jobId ? null : jobId);
  };

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employerJobs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employer/jobs');
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiClient.put(`/employer/jobs/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      toast.success('Job status updated');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update job status';
      toast.error(msg);
    }
  });

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/employer/jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      toast.success('Draft job deleted successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to delete job';
      toast.error(msg);
    }
  });

  const handleDeleteJob = (id: number) => {
    if (window.confirm('Are you sure you want to delete this draft job?')) {
      deleteJobMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-500">Manage your active and drafted job postings.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              const toastId = toast.loading('Resyncing with Elasticsearch...');
              try {
                await apiClient.post('/employer/jobs/resync-elasticsearch');
                toast.success('Successfully resynced all jobs to Search Engine!', { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
              } catch (err) {
                toast.error('Failed to resync jobs. Check server logs.', { id: toastId });
              }
            }}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            Resync Search
          </button>
          <Link 
            to="/dashboard/jobs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Job
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading jobs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-500">
                <th className="p-4">Job Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Department</th>
                <th className="p-4">Posted Date</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {jobs?.map((job: any) => (
                <React.Fragment key={job.id}>
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{job.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                        job.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{job.department || '-'}</td>
                    <td className="p-4 text-slate-600">{job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-slate-600">{job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/dashboard/jobs/${job.id}/board`}
                          className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100 transition-colors"
                        >
                          View Pipeline
                        </Link>
                        {job.status === 'DRAFT' && (
                          <>
                            <Link 
                              to={`/dashboard/jobs/${job.id}/edit`}
                              className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                            <button 
                              onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                              className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-md font-medium hover:bg-green-100 transition-colors"
                            >
                              Publish
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-sm bg-red-50 text-red-600 p-1.5 rounded-md font-medium hover:bg-red-100 transition-colors"
                              title="Delete Draft"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {job.status === 'PUBLISHED' && (
                          <>
                            <button
                              onClick={() => toggleRecommendations(job.id)}
                              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                                expandedJobId === job.id
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              {expandedJobId === job.id ? 'Hide' : 'Recommended'}
                            </button>
                            <button 
                              onClick={() => handleStatusChange(job.id, 'CLOSED')}
                              className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100 transition-colors"
                            >
                              Close
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedJobId === job.id && (
                    <tr>
                      <td colSpan={6} className="px-4 pb-4 bg-slate-50">
                        <div className="pt-3">
                          <RecommendedCandidates jobId={job.id} jobTitle={job.title} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {jobs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    You haven't posted any jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
