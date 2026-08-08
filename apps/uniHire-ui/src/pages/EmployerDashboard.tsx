import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Eye, Users, Percent } from 'lucide-react';
import apiClient from '../services/apiClient';

interface AnalyticsData {
  totalActiveJobs: number;
  totalJobViews: number;
  totalApplications: number;
  totalHires: number;
  applicationConversionRate: number;
  viewsOverTime: Record<string, number>;
}

export default function EmployerDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['employerAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/employer/analytics/dashboard');
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading dashboard metrics...</div>;
  }

  // Transform viewsOverTime for Recharts
  const chartData = Object.entries(analytics?.viewsOverTime || {}).map(([date, views]) => ({
    date: date.substring(5), // Just MM-DD for cleaner X-Axis
    views
  }));

  const metrics = [
    { label: 'Active Jobs', value: analytics?.totalActiveJobs || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Views', value: analytics?.totalJobViews || 0, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Applications', value: analytics?.totalApplications || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Conversion', value: `${analytics?.applicationConversionRate?.toFixed(1) || 0}%`, icon: Percent, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-4 rounded-lg ${m.bg}`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{m.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Views Over Time (30 Days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
