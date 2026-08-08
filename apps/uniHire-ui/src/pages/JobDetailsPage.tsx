import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Calendar, CheckCircle, Clock, Loader2, ArrowLeft,
  Users, GraduationCap, Award, Globe, Monitor, Coffee, AlertCircle, Banknote,
  ClipboardList, FileText, ChevronRight, Star, Layers, Tag, BookOpen, UserCheck,
  BarChart2, MessageSquare, Car
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import ApplicationModal from '../components/candidate/ApplicationModal';

function TagChip({ label, color = 'blue' }: { label: string; color?: 'blue' | 'green' | 'purple' | 'orange' | 'slate' | 'rose' }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[color]}`}>
      {label}
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
        <span className="text-blue-500">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const { data: myApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/applications');
      return data;
    },
    enabled: isAuthenticated && user?.role === 'CANDIDATE',
  });

  const isAlreadyApplied = Boolean(
    myApplications?.some((app: any) => String(app.jobId) === String(id))
  );

  const isApplied = hasApplied || isAlreadyApplied;

  useEffect(() => {
    if (searchParams.get('action') === 'apply' && isAuthenticated && user?.role === 'CANDIDATE') {
      if (!isAlreadyApplied) {
        setShowApplyModal(true);
      }
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, isAuthenticated, user, setSearchParams, isAlreadyApplied]);

  useEffect(() => {
    if (id) {
      apiClient.post(`/public/jobs/${id}/view`).catch(() => {});
    }
  }, [id]);

  const { data: job, isLoading } = useQuery({
    queryKey: ['publicJob', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/public/jobs/${id}`);
      return data;
    },
  });

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/jobs/${id}&action=apply`);
      return;
    }
    if (user?.role === 'EMPLOYER') {
      alert('Employers cannot apply for jobs.');
      return;
    }
    if (isApplied) {
      return;
    }
    setShowApplyModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900">Job Not Found</h2>
        <Link to="/" className="text-blue-600 mt-4 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const splitComma = (val: string | null | undefined) =>
    val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const splitLines = (val: string | null | undefined) =>
    val ? val.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const experienceLabel = (job.minExperience != null && job.maxExperience != null)
    ? `${job.minExperience}–${job.maxExperience} Years`
    : job.experience || null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* ── HEADER CARD ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
          {/* Coloured top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                {/* Company logo placeholder + title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
                    {job.companyName ? job.companyName.charAt(0).toUpperCase() : <Building2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                    {job.companyName && <p className="text-base text-slate-600 font-medium mt-0.5">{job.companyName}</p>}
                  </div>
                </div>

                {/* Quick badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {job.location && <TagChip label={`📍 ${job.location}`} color="slate" />}
                  {job.workMode && <TagChip label={job.workMode} color="blue" />}
                  {job.employmentType && <TagChip label={job.employmentType} color="purple" />}
                  {job.employmentCategory && <TagChip label={job.employmentCategory} color="orange" />}
                  {job.industry && <TagChip label={job.industry} color="slate" />}
                  {job.department && <TagChip label={job.department} color="slate" />}
                  {experienceLabel && <TagChip label={`${experienceLabel} exp.`} color="green" />}
                  {job.jobLevel && <TagChip label={job.jobLevel} color="rose" />}
                </div>

                {/* Salary + openings */}
                <div className="flex flex-wrap gap-6 text-sm">
                  {job.salary && (
                    <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                      <Banknote className="w-4 h-4" /> {job.salary}
                    </span>
                  )}
                  {job.incentives && (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <Star className="w-4 h-4" /> {job.incentives}
                    </span>
                  )}
                  {job.openings != null && job.openings > 0 && (
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4" /> {job.openings} Opening{job.openings > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-5 text-xs text-slate-400 mt-4">
                  {job.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Posted: {new Date(job.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {job.expiryDate && (
                    <span className="flex items-center gap-1 text-rose-400">
                      <Clock className="w-3.5 h-3.5" /> Apply before: {new Date(job.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="shrink-0 flex flex-col items-center md:items-end gap-3 md:min-w-[170px]">
                {isApplied ? (
                  <button disabled className="w-full bg-green-50 text-green-700 font-semibold px-8 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Applied
                  </button>
                ) : (
                  <button
                    onClick={handleApplyClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition-all text-base"
                  >
                    Apply Now →
                  </button>
                )}
                <p className="text-xs text-slate-400 text-center max-w-[170px]">Your profile will be shared with the employer.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left / main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Key Responsibilities */}
            {job.responsibilities && (
              <Section title="Key Responsibilities" icon={<ClipboardList className="w-5 h-5" />}>
                <ul className="space-y-2">
                  {splitLines(job.responsibilities).map((line: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
                      <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      {line}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Job Description */}
            {job.description && (
              <Section title="Job Description" icon={<FileText className="w-5 h-5" />}>
                <div className="space-y-3">
                  {splitLines(job.description).map((para: string, i: number) => (
                    <p key={i} className="text-slate-700 text-sm leading-relaxed">{para}</p>
                  ))}
                </div>
              </Section>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <Section title="Qualifications & Requirements" icon={<BookOpen className="w-5 h-5" />}>
                <ul className="space-y-2">
                  {splitLines(job.qualifications).map((line: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {line}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Interview Process */}
            {job.interviewProcess && (
              <Section title="Interview Process" icon={<MessageSquare className="w-5 h-5" />}>
                <div className="space-y-3">
                  {splitLines(job.interviewProcess).map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <p className="text-slate-700 text-sm leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Section title="Benefits & Perks" icon={<Coffee className="w-5 h-5" />}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {splitLines(job.benefits).map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {/* Right / sidebar */}
          <div className="space-y-6">

            {/* Job Overview */}
            <Section title="Job Overview" icon={<Layers className="w-5 h-5" />}>
              <dl className="space-y-3 text-sm">
                {experienceLabel && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><BarChart2 className="w-4 h-4" />Experience</dt>
                    <dd className="font-medium text-slate-800">{experienceLabel}</dd>
                  </div>
                )}
                {job.education && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />Education</dt>
                    <dd className="font-medium text-slate-800 text-right max-w-[130px]">{job.education}</dd>
                  </div>
                )}
                {job.jobLevel && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><UserCheck className="w-4 h-4" />Job Level</dt>
                    <dd className="font-medium text-slate-800">{job.jobLevel}</dd>
                  </div>
                )}
                {job.workMode && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><Monitor className="w-4 h-4" />Work Mode</dt>
                    <dd className="font-medium text-slate-800">{job.workMode}</dd>
                  </div>
                )}
                {job.workingDays && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-4 h-4" />Working Days</dt>
                    <dd className="font-medium text-slate-800">{job.workingDays}</dd>
                  </div>
                )}
                {job.shiftTiming && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4" />Shift</dt>
                    <dd className="font-medium text-slate-800">{job.shiftTiming}</dd>
                  </div>
                )}
                {job.travelRequirement && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><Car className="w-4 h-4" />Travel</dt>
                    <dd className="font-medium text-slate-800">{job.travelRequirement}</dd>
                  </div>
                )}
                {job.noticePeriod && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />Notice Period</dt>
                    <dd className="font-medium text-slate-800">{job.noticePeriod}</dd>
                  </div>
                )}
                {job.numberOfVacancies != null && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 flex items-center gap-1.5"><Users className="w-4 h-4" />Openings</dt>
                    <dd className="font-medium text-slate-800">{job.openings ?? job.numberOfVacancies}</dd>
                  </div>
                )}
              </dl>
            </Section>

            {/* Required Skills */}
            {splitComma(job.skills).length > 0 && (
              <Section title="Required Skills" icon={<Tag className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {splitComma(job.skills).map((skill: string, i: number) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Preferred Skills */}
            {splitComma(job.preferredSkills).length > 0 && (
              <Section title="Preferred Skills" icon={<Star className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {splitComma(job.preferredSkills).map((skill: string, i: number) => (
                    <span key={i} className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Certifications */}
            {splitComma(job.certifications).length > 0 && (
              <Section title="Required Certifications" icon={<Award className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {splitComma(job.certifications).map((cert: string, i: number) => (
                    <span key={i} className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-md text-xs font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Languages */}
            {splitComma(job.languages).length > 0 && (
              <Section title="Languages" icon={<Globe className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {splitComma(job.languages).map((lang: string, i: number) => (
                    <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Apply Again — sidebar CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl text-white text-center">
              <h3 className="font-bold text-lg mb-1">Interested?</h3>
              <p className="text-blue-100 text-sm mb-4">Submit your application now before the deadline.</p>
              {isApplied ? (
                <button disabled className="w-full bg-white text-green-700 font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                  <CheckCircle className="w-4 h-4 text-green-600" /> Already Applied
                </button>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  Apply Now →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplicationModal
          jobId={id!}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  );
}
