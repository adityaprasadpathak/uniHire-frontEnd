import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Lock, Unlock, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminCandidatesList: React.FC = () => {
  const queryClient = useQueryClient();
  const [lockReason, setLockReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<any>(null);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: adminApi.getCandidates
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.verifyCandidate(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-candidates'] });
    }
  });

  const verifyDocMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.verifyDocument(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-candidates'] });
    }
  });

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number, reason: string }) => adminApi.toggleUserLock(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-candidates'] });
      setSelectedUser(null);
      setLockReason('');
    }
  });

  if (isLoading) return <div className="p-8">Loading candidates...</div>;

  const handleToggleLock = (id: number, isLocked: boolean) => {
    if (isLocked) {
      lockMutation.mutate({ id, reason: '' });
    } else {
      setSelectedUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates?.map((cand: any) => (
              <tr key={cand.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{cand.firstName} {cand.lastName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{cand.email}</div>
                  <div className="text-sm text-gray-500">{cand.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cand.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    cand.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cand.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cand.isLocked ? (
                    <span className="flex items-center text-red-600 text-sm">
                      <Lock className="w-4 h-4 mr-1" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600 text-sm">
                      <Unlock className="w-4 h-4 mr-1" /> Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                  <button 
                    onClick={() => setViewingCandidate(cand)}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                    title="View Documents"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Docs
                  </button>
                  {cand.verificationStatus !== 'VERIFIED' && (
                    <button 
                      onClick={() => verifyMutation.mutate({ id: cand.id, status: 'VERIFIED' })}
                      className="text-indigo-600 hover:text-indigo-900 ml-2"
                    >
                      Verify
                    </button>
                  )}
                  {cand.verificationStatus !== 'REJECTED' && (
                    <button 
                      onClick={() => verifyMutation.mutate({ id: cand.id, status: 'REJECTED' })}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      Reject
                    </button>
                  )}
                  <button 
                    onClick={() => handleToggleLock(cand.id, cand.isLocked)}
                    className="text-gray-600 hover:text-gray-900 ml-2"
                  >
                    {cand.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Documents: {viewingCandidate.firstName} {viewingCandidate.lastName}
              </h3>
              <button onClick={() => setViewingCandidate(null)} className="text-gray-400 hover:text-gray-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {viewingCandidate.documents && viewingCandidate.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {viewingCandidate.documents.map((doc: any) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">{doc.documentType}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="aspect-video bg-gray-100 rounded-md mb-4 overflow-hidden flex items-center justify-center">
                        <img src={doc.url} alt={doc.documentType} className="object-contain w-full h-full" />
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
                          View Full Size
                        </a>
                        <div className="space-x-2">
                          <button 
                            onClick={() => {
                              verifyDocMutation.mutate({ id: doc.id, status: 'VERIFIED' });
                              const updatedDocs = viewingCandidate.documents.map((d: any) => d.id === doc.id ? { ...d, status: 'VERIFIED' } : d);
                              setViewingCandidate({ ...viewingCandidate, documents: updatedDocs });
                            }}
                            className="text-xs px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              verifyDocMutation.mutate({ id: doc.id, status: 'REJECTED' });
                              const updatedDocs = viewingCandidate.documents.map((d: any) => d.id === doc.id ? { ...d, status: 'REJECTED' } : d);
                              setViewingCandidate({ ...viewingCandidate, documents: updatedDocs });
                            }}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No documents uploaded yet.
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
              <button
                onClick={() => setViewingCandidate(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Lock Candidate Account</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Reason for locking..."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={() => lockMutation.mutate({ id: selectedUser, reason: lockReason })}
                disabled={!lockReason}
              >
                Lock Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidatesList;
