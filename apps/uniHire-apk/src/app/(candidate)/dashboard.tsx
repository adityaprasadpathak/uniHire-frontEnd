import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/apiClient';
import * as SecureStore from 'expo-secure-store';
import {
  FileText, CheckCircle, Briefcase, ChevronRight,
  Zap, MapPin, Clock, Star, RefreshCw, LogOut,
} from 'lucide-react-native';

interface Profile {
  firstName?: string;
  lastName?: string;
  resumeUrl?: string;
  profileCompletionScore?: number;
}

interface RecommendedJob {
  jobId: number;
  title: string;
  companyName: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  matchScore: number;
  reason?: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/candidate/profile');
      setProfile(res.data);
    } catch (e) {
      console.log('Profile fetch error:', e);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await apiClient.get('/recommendations/candidates/me/jobs');
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setJobs(data);
    } catch (e) {
      console.log('Recommendations fetch error:', e);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRecommendations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchRecommendations()]);
    setRefreshing(false);
  }, []);

  const triggerRefresh = async () => {
    setGenerating(true);
    try {
      await apiClient.post('/recommendations/candidates/me/trigger');
      setTimeout(async () => {
        await fetchRecommendations();
        setGenerating(false);
      }, 3000);
    } catch (e) {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    logout();
    router.replace('/(auth)/login');
  };

  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : profile?.firstName
    ? profile.firstName[0].toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';
  const completion = profile?.profileCompletionScore || 0;

  const scoreColor = (score: number) =>
    score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-zinc-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
    >
      {/* Welcome Header */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-4 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            {/* Avatar */}
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-xl font-extrabold text-white">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
                Welcome, {profileLoading ? '...' : displayName}!
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Candidate Dashboard</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} className="p-2">
            <LogOut size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Completion */}
        <View className="mt-4 bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Completion</Text>
            <Text className="text-sm font-bold text-blue-600">{completion}%</Text>
          </View>
          <View className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
            <View
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${completion}%` }}
            />
          </View>
          {completion < 100 && (
            <TouchableOpacity
              onPress={() => router.push('/(candidate)/profile')}
              className="flex-row items-center gap-1 mt-2"
            >
              <Text className="text-xs text-blue-600 font-medium">Complete your profile</Text>
              <ChevronRight size={12} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Action Cards */}
      <View className="flex-row gap-3 px-4 mt-4">
        {/* Resume Card */}
        <TouchableOpacity
          onPress={() => router.push('/(candidate)/profile')}
          className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800"
        >
          <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg items-center justify-center mb-3">
            <FileText size={20} color="#4f46e5" />
          </View>
          <Text className="text-sm font-bold text-slate-900 dark:text-white">Resume</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {profile?.resumeUrl ? 'Update resume' : 'Upload resume'}
          </Text>
        </TouchableOpacity>

        {/* Applications Card */}
        <TouchableOpacity
          onPress={() => router.push('/(candidate)/applications')}
          className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800"
        >
          <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg items-center justify-center mb-3">
            <CheckCircle size={20} color="#059669" />
          </View>
          <Text className="text-sm font-bold text-slate-900 dark:text-white">Applications</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track status</Text>
        </TouchableOpacity>

        {/* Browse Jobs Card */}
        <TouchableOpacity
          onPress={() => router.push('/(candidate)/jobs')}
          className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800"
        >
          <View className="w-10 h-10 bg-sky-50 dark:bg-sky-900/30 rounded-lg items-center justify-center mb-3">
            <Briefcase size={20} color="#0284c7" />
          </View>
          <Text className="text-sm font-bold text-slate-900 dark:text-white">Find Jobs</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse all</Text>
        </TouchableOpacity>
      </View>

      {/* AI Recommended Jobs */}
      <View className="mx-4 mt-4 mb-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-violet-50 dark:bg-violet-900/20">
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 bg-violet-100 dark:bg-violet-900/50 rounded-lg items-center justify-center">
              <Zap size={14} color="#7c3aed" />
            </View>
            <View>
              <Text className="text-sm font-bold text-slate-900 dark:text-white">AI Recommended Jobs</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">Matched to your skills</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={triggerRefresh}
            disabled={generating || jobsLoading}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
          >
            <RefreshCw size={14} color={generating ? '#7c3aed' : '#7c3aed'} />
            <Text className="text-xs font-medium text-violet-600">{generating ? 'Generating…' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>

        {/* Job List */}
        {jobsLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        ) : jobs.length === 0 ? (
          <View className="py-10 items-center px-6">
            <View className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
              <Briefcase size={28} color="#9ca3af" />
            </View>
            <Text className="text-slate-600 dark:text-slate-400 font-medium text-center">No recommendations yet</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 mb-4">Complete your profile and upload your resume to get personalized matches.</Text>
            <TouchableOpacity
              onPress={triggerRefresh}
              disabled={generating}
              className="flex-row items-center gap-2 px-4 py-2 bg-violet-600 rounded-lg"
            >
              <Zap size={16} color="#fff" />
              <Text className="text-white text-sm font-medium">{generating ? 'Generating…' : 'Generate Recommendations'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map((job, index) => {
            const color = scoreColor(job.matchScore);
            return (
              <View
                key={job.jobId?.toString() ?? index.toString()}
                className="p-4 border-b border-slate-50 dark:border-zinc-800"
              >
                <View className="flex-row items-start gap-3">
                  {/* Rank + Score */}
                  <View className="items-center gap-1">
                    <Text className="text-xs font-semibold text-slate-400">#{index + 1}</Text>
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center border-2"
                      style={{ borderColor: color }}
                    >
                      <Text className="text-xs font-bold" style={{ color }}>{Math.round(job.matchScore)}%</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-2">
                        <Text className="font-bold text-slate-900 dark:text-white" numberOfLines={1}>{job.title}</Text>
                        <Text className="text-sm text-slate-500 dark:text-slate-400">{job.companyName}</Text>
                      </View>
                    </View>

                    {/* Meta */}
                    <View className="flex-row flex-wrap gap-3 mt-1.5">
                      {job.location ? (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={12} color="#6b7280" />
                          <Text className="text-xs text-slate-500 dark:text-slate-400">{job.location}</Text>
                        </View>
                      ) : null}
                      {job.employmentType ? (
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color="#6b7280" />
                          <Text className="text-xs text-slate-500 dark:text-slate-400">{job.employmentType}</Text>
                        </View>
                      ) : null}
                      {job.salary ? (
                        <View className="flex-row items-center gap-1">
                          <Star size={12} color="#6b7280" />
                          <Text className="text-xs text-slate-500 dark:text-slate-400">{job.salary}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Matched Skills */}
                    {job.matchedSkills?.length > 0 && (
                      <View className="flex-row flex-wrap gap-1.5 mt-2">
                        {job.matchedSkills.slice(0, 4).map(skill => (
                          <View key={skill} className="bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-green-700 dark:text-green-400 font-medium">{skill}</Text>
                          </View>
                        ))}
                        {job.missingSkills?.slice(0, 2).map(skill => (
                          <View key={skill} className="bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-red-600 dark:text-red-400 font-medium">{skill}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {job.reason ? (
                      <Text className="text-xs text-slate-400 mt-1.5 italic" numberOfLines={1}>{job.reason}</Text>
                    ) : null}

                    <TouchableOpacity
                      onPress={() => router.push(`/(candidate)/jobs?jobId=${job.jobId}`)}
                      className="mt-3 self-start px-4 py-1.5 bg-violet-600 rounded-lg"
                    >
                      <Text className="text-white text-xs font-semibold">View & Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
