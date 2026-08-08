import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Link } from 'react-router-dom';

const AdminOverview: React.FC = () => {
  const { data: employers } = useQuery({
    queryKey: ['admin-employers'],
    queryFn: adminApi.getEmployers
  });

  const { data: candidates } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: adminApi.getCandidates
  });

  const pendingEmployers = employers?.filter((e: any) => e.verificationStatus === 'UNDER_REVIEW' || e.verificationStatus === 'PENDING').length || 0;
  const pendingCandidates = candidates?.filter((c: any) => c.verificationStatus === 'UNDER_REVIEW' || c.verificationStatus === 'PENDING').length || 0;
  
  const pendingDocs = candidates?.reduce((acc: number, c: any) => {
    return acc + (c.documents?.filter((d: any) => d.status === 'PENDING').length || 0);
  }, 0) || 0;

  const totalPending = pendingEmployers + pendingCandidates + pendingDocs;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Verifications</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalPending}</p>
          <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
            <div>Employers: {pendingEmployers}</div>
            <div>Candidates: {pendingCandidates}</div>
            <div>Documents: {pendingDocs}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Employers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{employers?.length || 0}</p>
          <div className="mt-4 flex text-sm text-indigo-600">
            <Link to="/admin/employers" className="font-medium hover:underline cursor-pointer">View employers &rarr;</Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Candidates</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{candidates?.length || 0}</p>
          <div className="mt-4 flex text-sm text-indigo-600">
            <Link to="/admin/candidates" className="font-medium hover:underline cursor-pointer">View candidates &rarr;</Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity or other widgets can go here */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">System Activity</h3>
        </div>
        <div className="p-6 text-gray-500 text-center">
          All systems operational. Overview statistics are live.
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
