import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Tag, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';

interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  employmentType: string;
  publishedAt: string;
  skills?: string;
  preferredSkills?: string;
}

const fetchJobs = async (keyword: string, location: string) => {
  const { data } = await apiClient.get('/public/jobs', {
    params: { keyword, location, size: 20 },
  });
  return data.content as Job[];
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState({ keyword: '', location: '' });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['publicJobs', searchTerm],
    queryFn: () => fetchJobs(searchTerm.keyword, searchTerm.location),
  });

  const { data: myApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/applications');
      return data;
    },
    enabled: isAuthenticated && user?.role === 'CANDIDATE',
  });

  const appliedJobIds = new Set(myApplications?.map((app: any) => app.jobId));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm({ keyword, location });
  };

  const splitComma = (val: string | null | undefined) =>
    val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">Find your next dream job</h1>
          <p className="text-xl opacity-90">Discover opportunities at top companies across the globe.</p>
          
          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-lg shadow-lg">
            <div className="flex-1 flex items-center px-4 bg-transparent text-slate-900">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Job title or keyword" 
                className="w-full py-3 outline-none bg-transparent"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="hidden sm:block w-px bg-slate-200"></div>
            <div className="flex-1 flex items-center px-4 bg-transparent text-slate-900">
              <MapPin className="w-5 h-5 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full py-3 outline-none bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">
          {jobs?.length ? `Found ${jobs.length} open roles` : 'Latest Opportunities'}
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading jobs...</div>
        ) : (
          <div className="grid gap-6">
            {jobs?.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shrink-0 mt-1">
                  {job.title.charAt(0)}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                      {job.companyName && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.companyName}</span>}
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location || 'Remote'}</span>
                    </div>
                  </div>
                  
                  {/* Skills Tags */}
                  {(splitComma(job.skills).length > 0 || splitComma(job.preferredSkills).length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {splitComma(job.skills).slice(0, 4).map((skill, i) => (
                        <span key={`req-${i}`} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-md text-xs font-medium">
                          <Tag className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                      {splitComma(job.preferredSkills).slice(0, 2).map((skill, i) => (
                        <span key={`pref-${i}`} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-md text-xs font-medium">
                          <Star className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-3 mt-4 sm:mt-0">
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{job.salary || 'Competitive'}</span>
                  <div className="flex items-center gap-3">
                    {appliedJobIds.has(job.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Applied
                      </span>
                    )}
                    <Link to={`/jobs/${job.id}`} className="text-blue-600 font-medium hover:underline text-sm">View details →</Link>
                  </div>
                </div>
              </div>
            ))}
            
            {jobs?.length === 0 && (
              <div className="text-center py-12 text-slate-500">No jobs found matching your criteria.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
