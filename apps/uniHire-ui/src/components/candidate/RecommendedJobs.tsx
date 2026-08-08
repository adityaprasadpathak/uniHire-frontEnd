import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recommendationApi } from '../../api/recommendationApi';
import type { RecommendedJobDto } from '../../api/recommendationApi';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Star, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/useAuthStore';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
      <svg className="absolute" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="20" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="32" cy="32" r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{Math.round(score)}%</span>
    </div>
  );
}

export default function RecommendedJobs() {
  const { isAuthenticated, user } = useAuthStore();

  const { data: jobs, isLoading, refetch, isFetching } = useQuery<RecommendedJobDto[]>({
    queryKey: ['recommendedJobs'],
    queryFn: recommendationApi.getRecommendedJobs,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  const { mutate: triggerRefresh, isPending: isGenerating } = useMutation({
    mutationFn: recommendationApi.triggerCandidateRecommendations,
    onSuccess: () => {
      setTimeout(() => refetch(), 3000); // Wait 3s for async generation then refetch
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-100 rounded-lg">
            <Zap className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Recommended Jobs</h2>
            <p className="text-xs text-slate-500">Matched to your skills & experience</p>
          </div>
        </div>
        <button
          onClick={() => triggerRefresh()}
          disabled={isGenerating || isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(isGenerating || isFetching) ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating…' : 'Refresh'}
        </button>
      </div>

      {/* Body */}
      <div className="divide-y divide-slate-50">
        {!jobs || jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No recommendations yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Complete your profile with skills and experience to get personalized job recommendations.
            </p>
            <button
              onClick={() => triggerRefresh()}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {isGenerating ? 'Generating…' : 'Generate Recommendations'}
            </button>
          </div>
        ) : (
          jobs.map((job, index) => (
            <JobCard key={job.jobId} job={job} rank={index + 1} isApplied={appliedJobIds.has(job.jobId)} />
          ))
        )}
      </div>
    </div>
  );
}

function JobCard({ job, rank, isApplied }: { job: RecommendedJobDto; rank: number; isApplied: boolean }) {
  const scoreColor = job.matchScore >= 80 ? 'text-green-600' : job.matchScore >= 60 ? 'text-blue-600' : 'text-amber-600';

  return (
    <div className="group p-5 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Rank + Score Ring */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-slate-400">#{rank}</span>
          <ScoreRing score={job.matchScore} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{job.companyName}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-100 ${scoreColor} flex-shrink-0`}>
              {Math.round(job.matchScore)}% Match
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
            {job.employmentType && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {job.employmentType}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {job.salary}
              </span>
            )}
          </div>

          {/* Matched / Missing Skills */}
          {job.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.matchedSkills.slice(0, 5).map(skill => (
                <span key={skill} className="flex items-center gap-0.5 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-2.5 h-2.5" /> {skill}
                </span>
              ))}
              {job.missingSkills.slice(0, 2).map(skill => (
                <span key={skill} className="flex items-center gap-0.5 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  <XCircle className="w-2.5 h-2.5" /> {skill}
                </span>
              ))}
            </div>
          )}

          {/* Reason */}
          {job.reason && (
            <p className="text-xs text-slate-400 mt-1.5 italic truncate">{job.reason}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {isApplied ? (
              <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Applied
              </span>
            ) : (
              <Link
                to={`/jobs/${job.jobId}`}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Apply Now
              </Link>
            )}
            <Link
              to={`/jobs/${job.jobId}`}
              className="px-4 py-1.5 border border-slate-200 hover:border-violet-300 hover:text-violet-600 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
