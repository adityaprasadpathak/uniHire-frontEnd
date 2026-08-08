import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import { FileUp, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function DocumentUploader() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('PHOTO');
  const [file, setFile] = useState<File | null>(null);

  const documentTypes = [
    'PHOTO', 'AADHAAR', 'PASSPORT', 'HIGH_SCHOOL', 
    'INTERMEDIATE', 'GRADUATION', 'POST_GRADUATION', 
    'CERTIFICATION', 'OTHER'
  ];

  const { data: profile } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/candidate/profile');
      return data;
    },
  });

  // Assume documents are added to profile API in future or we fetch separately.
  // Wait, I need to fetch candidate documents if they aren't included in the profile DTO.
  // But wait, the backend `getProfile` doesn't include `documents` yet! I should add `documents` to `CandidateProfileDto.java` and `CandidateService.getProfile`.

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Verification Documents</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload documents to get your profile verified. Verified profiles get more attention from employers.
          Status: <span className="font-semibold">{profile?.verificationStatus || 'PENDING'}</span>
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select 
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {documentTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={async () => {
              if (!file) return toast.error("Please select a file");
              if (file.size > 10 * 1024 * 1024) {
                return toast.error("File size exceeds 10MB limit. Please select a smaller file.");
              }
              const formData = new FormData();
              formData.append("type", selectedType);
              formData.append("file", file);
              try {
                await apiClient.post('/candidate/documents/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Document uploaded successfully");
                setFile(null);
                queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
              } catch (e: any) {
                toast.error(e?.response?.data?.message || "Upload failed");
              }
            }}
            disabled={!file}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 flex items-center justify-center"
          >
            <FileUp className="w-4 h-4 mr-2" /> Upload
          </button>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Uploaded Documents</h3>
          {profile?.documents && profile.documents.length > 0 ? (
            <ul className="space-y-3">
              {profile.documents.map((doc: any) => (
                <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${doc.status === 'VERIFIED' ? 'text-green-500' : doc.status === 'REJECTED' ? 'text-red-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="font-medium text-slate-700">{doc.documentType.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">{doc.originalFilename || 'Document'} • Status: {doc.status}</p>
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
            <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-md">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
