import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import {
  Briefcase, Eye, Users, Percent, Plus, Trash,
  Sparkles, LogOut, Building2, ChevronRight, CheckCircle,
} from 'lucide-react-native';

interface AnalyticsData {
  totalActiveJobs: number;
  totalJobViews: number;
  totalApplications: number;
  applicationConversionRate: number;
}

interface Job {
  id: number;
  title: string;
  status: string;
  department?: string;
  publishedAt?: string;
  expiryDate?: string;
}

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        apiClient.get('/employer/analytics/dashboard'),
        apiClient.get('/employer/jobs'),
      ]);
      setAnalytics(analyticsRes.data);
      const jobData = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.content ?? []);
      setJobs(jobData);
    } catch (e) {
      console.log('Employer Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.put(`/employer/jobs/${id}/status`, { status });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (e) {
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/employer/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) {
      Alert.alert('Error', 'Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    logout();
    router.replace('/(auth)/login');
  };

  const metrics = [
    { label: 'Active Jobs',   value: analytics?.totalActiveJobs ?? 0,                                icon: Briefcase, bg: '#dbeafe', color: '#2563eb' },
    { label: 'Total Views',   value: analytics?.totalJobViews ?? 0,                                  icon: Eye,       bg: '#ede9fe', color: '#7c3aed' },
    { label: 'Applications',  value: analytics?.totalApplications ?? 0,                              icon: Users,     bg: '#d1fae5', color: '#059669' },
    { label: 'Conversion',    value: `${(analytics?.applicationConversionRate ?? 0).toFixed(1)}%`,   icon: Percent,   bg: '#fef3c7', color: '#d97706' },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return { bg: '#d1fae5', text: '#065f46' };
      case 'DRAFT':     return { bg: '#f1f5f9', text: '#475569' };
      default:          return { bg: '#fee2e2', text: '#991b1b' };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-zinc-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
    >
      {/* Header Banner */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-4 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5 flex-1">
            <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center">
              <Building2 size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-slate-900 dark:text-white">Employer Portal</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} className="p-2">
            <LogOut size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Grid */}
      <View className="flex-row flex-wrap px-4 gap-3 mt-4">
        {metrics.map((m, i) => (
          <View
            key={i}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800 flex-row items-center gap-3"
            style={{ width: '47%' }}
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: m.bg }}>
              <m.icon size={18} color={m.color} />
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</Text>
              <Text className="text-xl font-extrabold text-slate-900 dark:text-white">{m.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Action Shortcuts */}
      <View className="flex-row gap-3 px-4 mt-4">
        <TouchableOpacity
          onPress={() => router.push('/(employer)/create-job')}
          className="flex-1 bg-blue-600 rounded-2xl p-4 shadow-sm items-center flex-row justify-center gap-2"
        >
          <Plus size={18} color="#fff" />
          <Text className="text-white font-bold text-sm">Post New Job</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(employer)/candidates')}
          className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800 items-center flex-row justify-center gap-2"
        >
          <Users size={18} color="#2563eb" />
          <Text className="text-slate-900 dark:text-white font-bold text-sm">Candidates</Text>
        </TouchableOpacity>
      </View>

      {/* Job Postings Section */}
      <View className="mx-4 mt-5 mb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-slate-900 dark:text-white">Active Job Postings</Text>
          <Text className="text-xs font-semibold text-slate-500">{jobs.length} Jobs</Text>
        </View>

        {jobs.length === 0 ? (
          <View className="bg-white dark:bg-zinc-900 rounded-2xl p-8 items-center border border-slate-100 dark:border-zinc-800">
            <Briefcase size={36} color="#9ca3af" />
            <Text className="text-slate-600 dark:text-slate-400 font-semibold mt-3 text-center">No job postings yet</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 mb-4">Create your first job posting to start receiving applications.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(employer)/create-job')}
              className="bg-blue-600 px-5 py-2.5 rounded-xl flex-row items-center gap-2"
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-bold text-sm">Create Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map((job) => {
            const sc = statusColor(job.status);
            return (
              <View
                key={job.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-zinc-800"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="font-bold text-slate-900 dark:text-white text-base" numberOfLines={1}>{job.title}</Text>
                    {job.department ? (
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.department}</Text>
                    ) : null}
                  </View>
                  <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: sc.bg }}>
                    <Text className="text-xs font-semibold" style={{ color: sc.text }}>{job.status}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-zinc-800">
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(employer)/pipeline', params: { jobId: job.id } })}
                    className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                  >
                    <Users size={13} color="#2563eb" />
                    <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">Pipeline</Text>
                  </TouchableOpacity>

                  {job.status === 'PUBLISHED' && (
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/(employer)/recommended-candidates', params: { jobId: job.id, jobTitle: job.title } })}
                      className="bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                    >
                      <Sparkles size={13} color="#7c3aed" />
                      <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">AI Matches</Text>
                    </TouchableOpacity>
                  )}

                  {job.status === 'DRAFT' && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleStatusChange(job.id, 'PUBLISHED')}
                        className="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl"
                      >
                        <Text className="text-xs font-semibold text-green-700 dark:text-green-400">Publish</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                      >
                        {deletingId === job.id
                          ? <ActivityIndicator size={12} color="#dc2626" />
                          : <Trash size={13} color="#dc2626" />}
                        <Text className="text-xs font-semibold text-red-600 dark:text-red-400">Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {job.status === 'PUBLISHED' && (
                    <TouchableOpacity
                      onPress={() => handleStatusChange(job.id, 'CLOSED')}
                      className="bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl"
                    >
                      <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">Close</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
