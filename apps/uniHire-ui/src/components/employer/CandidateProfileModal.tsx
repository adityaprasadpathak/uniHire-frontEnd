import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, User, Mail, Phone, ExternalLink, GraduationCap, Briefcase, FileUp, CheckCircle, Eye } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface CandidateProfileModalProps {
  candidateId: number;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidateId, onClose }: CandidateProfileModalProps) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['candidateProfile', candidateId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/employer/candidates/${candidateId}`);
      return data;
    },
  });

  const photoDoc = profile?.documents?.find((d: any) => d.documentType === 'PHOTO');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Candidate Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4 bg-white rounded-lg shadow-sm">Failed to load candidate profile.</div>
          ) : profile ? (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {photoDoc ? (
                      <img src={photoDoc.url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-slate-600">
                      {profile.phone && (
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <Phone className="w-4 h-4 text-slate-400" /> {profile.phone}
                        </div>
                      )}
                      {profile.portfolioUrl && (
                        <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 justify-center sm:justify-start text-blue-600 hover:underline">
                          <ExternalLink className="w-4 h-4" /> Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Languages */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills ? (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((skill: string, idx: number) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                        {skill.trim()}
                      </span>
                    )) : <span className="text-slate-400 text-sm">No skills listed</span>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages ? profile.languages.split(',').map((lang: string, idx: number) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                        {lang.trim()}
                      </span>
                    )) : <span className="text-slate-400 text-sm">No languages listed</span>}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" /> Experience
                </h4>
                {profile.experiences && profile.experiences.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experiences.map((exp: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-indigo-100 pl-4 relative">
                        <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-2"></div>
                        <h5 className="font-bold text-slate-900">{exp.jobTitle} at {exp.companyName}</h5>
                        <p className="text-sm text-slate-500 mb-2">
                          {exp.startDate} - {exp.currentJob ? 'Present' : (exp.endDate ? exp.endDate : 'N/A')}
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No experience listed.</p>
                )}
              </div>

              {/* Education */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" /> Education
                </h4>
                {profile.educations && profile.educations.length > 0 ? (
                  <div className="space-y-6">
                    {profile.educations.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-purple-100 pl-4 relative">
                        <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[5px] top-2"></div>
                        <h5 className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h5>
                        <p className="text-sm text-slate-600 font-medium">{edu.institutionName}</p>
                        <p className="text-sm text-slate-500 mb-1">
                          {edu.startDate} - {edu.endDate ? edu.endDate : 'Present'}
                        </p>
                        {edu.grade && <p className="text-sm text-slate-700">Grade: {edu.grade}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No education listed.</p>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-500" /> Uploaded Documents
                </h4>
                {profile.documents && profile.documents.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.documents.map((doc: any) => (
                      <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <CheckCircle className={`w-5 h-5 ${doc.status === 'VERIFIED' ? 'text-green-500' : doc.status === 'REJECTED' ? 'text-red-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="font-medium text-slate-700">{doc.documentType?.replace('_', ' ') || 'Document'}</p>
                            <p className="text-xs text-slate-500">{doc.originalFilename || 'File'} • Status: {doc.status}</p>
                          </div>
                        </div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md"
                        >
                          <Eye className="w-4 h-4" /> View
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">No documents uploaded.</p>
                )}
              </div>

            </div>
          ) : null}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
