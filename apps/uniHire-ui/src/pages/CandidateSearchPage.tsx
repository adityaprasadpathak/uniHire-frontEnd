import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, User, Star, Briefcase } from 'lucide-react';
import apiClient from '../services/apiClient';
import CandidateProfileModal from '../components/employer/CandidateProfileModal';

interface CandidateSummary {
  candidateId: number;
  name: string;
  topSkills: string[];
  similarityScore: number;
}

export default function CandidateSearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const { data: candidates, isLoading, isError, error } = useQuery<CandidateSummary[]>({
    queryKey: ['candidateSearch', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/employer/candidates/search', {
        params: { query: searchQuery, topK: 10 }
      });
      return response.data;
    },
    enabled: !!searchQuery, // Only run query if searchQuery is not empty
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-8 h-8 text-blue-600" /> AI Candidate Search
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Describe the perfect candidate in natural language. Our AI will search the resume database and find the best matches.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-10">
          <input
            type="text"
            className="w-full pl-6 pr-32 py-5 text-lg rounded-2xl border-2 border-slate-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            placeholder="e.g. 'Looking for a senior Java backend developer with microservices experience'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Results Section */}
        {isError && (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 mb-8">
            <h3 className="font-bold text-lg mb-1">Search Failed</h3>
            <p>{(error as any)?.response?.data?.message || error.message || 'An unexpected error occurred.'}</p>
          </div>
        )}

        {searchQuery && !isLoading && candidates?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No candidates found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates?.map((candidate) => (
            <div key={candidate.candidateId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{candidate.name || 'Anonymous Candidate'}</h3>
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-500 mt-1">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{candidate.similarityScore ? (candidate.similarityScore * 100).toFixed(1) : 0}% Match</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-grow">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Top Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.topSkills && candidate.topSkills.length > 0 ? (
                    candidate.topSkills.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm italic">No skills listed</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedCandidateId(candidate.candidateId)}
                  className="w-full text-center bg-white border-2 border-indigo-100 text-indigo-600 font-semibold py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCandidateId && (
        <CandidateProfileModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}
    </div>
  );
}
