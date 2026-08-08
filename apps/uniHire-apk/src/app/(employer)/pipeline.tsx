import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';
import { ArrowLeft, User, Zap, Mail, Calendar, CheckCircle2 } from 'lucide-react-native';

interface Application {
  id: number;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  status: string;
  appliedAt: string;
  aiMatchScore?: number;
  aiFitAnalysis?: string;
}

const STAGES = [
  { id: 'ALL', label: 'All' },
  { id: 'APPLIED', label: 'Applied' },
  { id: 'SHORTLISTED', label: 'Shortlisted' },
  { id: 'INTERVIEW_SCHEDULED', label: 'Interviewing' },
  { id: 'OFFERED', label: 'Offered' },
  { id: 'HIRED', label: 'Hired' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function PipelineScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPipeline = async () => {
    if (!jobId) return;
    try {
      const res = await apiClient.get(`/employer/jobs/${jobId}/applications`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setApplications(data);
    } catch (e) {
      console.log('Pipeline fetch error:', e);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPipeline(); }, [jobId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPipeline();
  }, [jobId]);

  const updateStatus = async (appId: number, status: string) => {
    setUpdatingId(appId);
    try {
      await apiClient.put(`/employer/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = selectedStage === 'ALL'
    ? applications
    : applications.filter(a => a.status === selectedStage);

  const renderCandidateCard = ({ item }: { item: Application }) => (
    <View className="bg-white dark:bg-zinc-900 mx-4 mb-3 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
            <User size={18} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-900 dark:text-white text-base">{item.candidateName || 'Candidate'}</Text>
            {item.candidateEmail ? (
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.candidateEmail}</Text>
            ) : null}
          </View>
        </View>

        {item.aiMatchScore != null && (
          <View className="bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <Zap size={12} color="#7c3aed" />
            <Text className="text-xs font-bold text-violet-700 dark:text-violet-400">{item.aiMatchScore}% Match</Text>
          </View>
        )}
      </View>

      {item.aiFitAnalysis ? (
        <View className="mt-3 p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-lg">
          <Text className="text-xs text-slate-600 dark:text-slate-300 leading-4">{item.aiFitAnalysis}</Text>
        </View>
      ) : null}

      {/* Stage Actions */}
      <View className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800 flex-row flex-wrap gap-2">
        {['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED'].map(stage => (
          <TouchableOpacity
            key={stage}
            onPress={() => updateStatus(item.id, stage)}
            disabled={updatingId === item.id || item.status === stage}
            className={`px-2.5 py-1 rounded-lg border ${
              item.status === stage
                ? 'bg-blue-600 border-blue-600'
                : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.status === stage ? 'text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {stage.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">Applicant Pipeline</Text>
      </View>

      {/* Stage Filter Chips */}
      <View className="bg-white dark:bg-zinc-900 py-3 border-b border-slate-100 dark:border-zinc-800">
        <FlatList
          horizontal
          data={STAGES}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStage(item.id)}
              className={`px-3.5 py-1.5 rounded-full border ${
                selectedStage === item.id
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedStage === item.id ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          renderItem={renderCandidateCard}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
                <User size={28} color="#9ca3af" />
              </View>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-center">No applicants in this stage</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
