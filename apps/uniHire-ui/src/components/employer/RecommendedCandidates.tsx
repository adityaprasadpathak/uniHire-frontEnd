import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recommendationApi } from '../../api/recommendationApi';
import type { RecommendedCandidateDto } from '../../api/recommendationApi';
import { Users, CheckCircle, XCircle, RefreshCw, Sparkles, Briefcase, GraduationCap, Award } from 'lucide-react';
import CandidateProfileModal from './CandidateProfileModal';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400';
  const textColor = score >= 80 ? 'text-green-700' : score >= 60 ? 'text-blue-700' : score >= 40 ? 'text-amber-700' : 'text-red-600';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${textColor}`}>{Math.round(score)}% Match</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface RecommendedCandidatesProps {
  jobId: number;
  jobTitle?: string;
}

export default function RecommendedCandidates({ jobId, jobTitle }: RecommendedCandidatesProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const { data: candidates, isLoading, refetch, isFetching } = useQuery<RecommendedCandidateDto[]>({
    queryKey: ['recommendedCandidates', jobId],
    queryFn: () => recommendationApi.getRecommendedCandidates(jobId),
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: triggerRefresh, isPending: isGenerating } = useMutation({
    mutationFn: () => recommendationApi.triggerJobRecommendations(jobId),
    onSuccess: () => {
      setTimeout(() => refetch(), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-900">Recommended Candidates</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Recommended Candidates</h2>
              <p className="text-xs text-slate-500">
                {jobTitle ? `Top matches for "${jobTitle}"` : 'Top candidates for this role'}
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerRefresh()}
            disabled={isGenerating || isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isGenerating || isFetching) ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating…' : 'Refresh'}
          </button>
        </div>

        {/* Body */}
        <div className="divide-y divide-slate-50">
          {!candidates || candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No recommendations yet</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">
                Recommendations are being generated. This takes a moment — refresh after a few seconds.
              </p>
              <button
                onClick={() => triggerRefresh()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating…' : 'Generate Now'}
              </button>
            </div>
          ) : (
            candidates.map((candidate, index) => (
              <CandidateCard 
                key={candidate.candidateId} 
                candidate={candidate} 
                rank={index + 1} 
                onViewProfile={() => setSelectedCandidateId(candidate.candidateId)}
              />
            ))
          )}
        </div>
      </div>

      {selectedCandidateId && (
        <CandidateProfileModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}
    </>
  );
}

function CandidateCard({ candidate, rank, onViewProfile }: { candidate: RecommendedCandidateDto; rank: number, onViewProfile: () => void }) {
  const initials = candidate.name
    ? candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  const avatarColors = [
    'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const colorClass = avatarColors[(rank - 1) % avatarColors.length];

  return (
    <div className="group p-5 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar + Rank */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-400">#{rank}</span>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${colorClass}`}>
            {initials}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {candidate.name || 'Anonymous Candidate'}
            </h3>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
            {candidate.experienceYears != null && candidate.experienceYears > 0 && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {candidate.experienceYears} yr{candidate.experienceYears !== 1 ? 's' : ''} exp.
              </span>
            )}
            {candidate.highestDegree && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> {candidate.highestDegree}
              </span>
            )}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" /> {candidate.certifications[0]}
                {candidate.certifications.length > 1 && ` +${candidate.certifications.length - 1}`}
              </span>
            )}
          </div>

          {/* Score bar */}
          <div className="mt-2">
            <ScoreBar score={candidate.matchScore} />
          </div>

          {/* Matched / Missing Skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidate.matchedSkills.slice(0, 5).map(skill => (
              <span key={skill} className="flex items-center gap-0.5 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-2.5 h-2.5" /> {skill}
              </span>
            ))}
            {candidate.missingSkills.slice(0, 2).map(skill => (
              <span key={skill} className="flex items-center gap-0.5 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                <XCircle className="w-2.5 h-2.5" /> {skill}
              </span>
            ))}
          </div>

          {/* Reason */}
          {candidate.reason && (
            <p className="text-xs text-slate-400 mt-1.5 italic truncate">{candidate.reason}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onViewProfile}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              View Profile
            </button>
            <button className="px-4 py-1.5 border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 text-xs font-semibold rounded-lg transition-colors">
              Shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
