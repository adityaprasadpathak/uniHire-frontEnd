import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';
import {
  ArrowLeft, MapPin, Clock, Building, Star, Briefcase, CheckCircle,
} from 'lucide-react-native';

interface JobDetail {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  department?: string;
  employer?: { companyName: string; website?: string };
  publishedAt?: string;
  expiryDate?: string;
}

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/public/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(e => console.log('Job detail error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await apiClient.post(`/candidate/jobs/${id}/apply`);
      setApplied(true);
      Alert.alert('Success', 'You have successfully applied for this job!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-950 px-8">
        <Text className="text-slate-600 dark:text-slate-400 font-semibold">Job not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Back Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>{job.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Job Header Card */}
        <View className="bg-white dark:bg-zinc-900 mx-4 mt-4 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
          <Text className="text-xl font-bold text-slate-900 dark:text-white mb-1">{job.title}</Text>
          <View className="flex-row items-center gap-1.5 mb-3">
            <Building size={15} color="#6b7280" />
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {job.employer?.companyName || 'Company'}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {job.location ? (
              <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                <MapPin size={13} color="#6b7280" />
                <Text className="text-xs text-slate-600 dark:text-slate-400">{job.location}</Text>
              </View>
            ) : null}
            {job.employmentType ? (
              <View className="flex-row items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                <Clock size={13} color="#2563eb" />
                <Text className="text-xs text-blue-700 dark:text-blue-400">{job.employmentType}</Text>
              </View>
            ) : null}
            {job.salary ? (
              <View className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                <Star size={13} color="#059669" />
                <Text className="text-xs text-green-700 dark:text-green-400">{job.salary}</Text>
              </View>
            ) : null}
            {job.department ? (
              <View className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                <Briefcase size={13} color="#6b7280" />
                <Text className="text-xs text-slate-600 dark:text-slate-400">{job.department}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Description */}
        {job.description ? (
          <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
            <Text className="text-sm font-bold text-slate-900 dark:text-white mb-2">About the Role</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6">{job.description}</Text>
          </View>
        ) : null}

        {/* Requirements */}
        {job.requirements ? (
          <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
            <Text className="text-sm font-bold text-slate-900 dark:text-white mb-2">Requirements</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 leading-6">{job.requirements}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Apply Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 px-4 py-4 border-t border-slate-100 dark:border-zinc-800">
        {applied ? (
          <View className="flex-row items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 py-3.5 rounded-xl border border-green-200">
            <CheckCircle size={18} color="#059669" />
            <Text className="text-green-700 dark:text-green-400 font-semibold">Applied Successfully!</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleApply}
            disabled={applying}
            className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center gap-2"
          >
            {applying ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text className="text-white font-bold text-base">Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
