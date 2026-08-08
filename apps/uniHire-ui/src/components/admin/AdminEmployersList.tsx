import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';

const AdminEmployersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [lockReason, setLockReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const { data: employers, isLoading } = useQuery({
    queryKey: ['admin-employers'],
    queryFn: adminApi.getEmployers
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.verifyEmployer(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
    }
  });

  const lockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number, reason: string }) => adminApi.toggleUserLock(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      setSelectedUser(null);
      setLockReason('');
    }
  });

  if (isLoading) return <div className="p-8">Loading employers...</div>;

  const handleToggleLock = (id: number, isLocked: boolean) => {
    if (isLocked) {
      // Unlock requires no reason
      lockMutation.mutate({ id, reason: '' });
    } else {
      setSelectedUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Employers</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employers?.map((emp: any) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{emp.companyName || 'Not setup'}</div>
                  <div className="text-sm text-gray-500">GST: {emp.gstDetails || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{emp.email}</div>
                  <div className="text-sm text-gray-500">{emp.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    emp.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    emp.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {emp.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {emp.isLocked ? (
                    <span className="flex items-center text-red-600 text-sm">
                      <Lock className="w-4 h-4 mr-1" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600 text-sm">
                      <Unlock className="w-4 h-4 mr-1" /> Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {emp.verificationStatus !== 'VERIFIED' && (
                    <button 
                      onClick={() => verifyMutation.mutate({ id: emp.id, status: 'VERIFIED' })}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Verify
                    </button>
                  )}
                  {emp.verificationStatus !== 'REJECTED' && (
                    <button 
                      onClick={() => verifyMutation.mutate({ id: emp.id, status: 'REJECTED' })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  )}
                  <button 
                    onClick={() => handleToggleLock(emp.id, emp.isLocked)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {emp.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Lock User Account</h3>
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

export default AdminEmployersList;
