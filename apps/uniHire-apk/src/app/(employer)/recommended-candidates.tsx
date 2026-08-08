import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';
import { ArrowLeft, User, Zap, Mail, Phone, CheckCircle, XCircle } from 'lucide-react-native';

interface CandidateRecommendation {
  candidateId: number;
  name: string;
  email?: string;
  phone?: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason?: string;
}

export default function RecommendedCandidatesScreen() {
  const router = useRouter();
  const { jobId, jobTitle } = useLocalSearchParams<{ jobId: string; jobTitle: string }>();

  const [candidates, setCandidates] = useState<CandidateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    if (!jobId) return;
    try {
      const res = await apiClient.get(`/recommendations/jobs/${jobId}/candidates`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setCandidates(data);
    } catch (e) {
      console.log('Candidate recommendations error:', e);
      setCandidates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, [jobId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecommendations();
  }, [jobId]);

  const renderCandidateCard = ({ item, index }: { item: CandidateRecommendation; index: number }) => {
    const scoreColor = item.matchScore >= 80 ? '#059669' : item.matchScore >= 60 ? '#2563eb' : '#d97706';

    return (
      <View className="bg-white dark:bg-zinc-900 mx-4 mb-3 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Text className="text-xs font-bold text-slate-400">#{index + 1}</Text>
            <View className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
              <User size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 dark:text-white text-base">{item.name}</Text>
              {item.email ? (
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.email}</Text>
              ) : null}
            </View>
          </View>

          <View
            className="w-12 h-12 rounded-full items-center justify-center border-2"
            style={{ borderColor: scoreColor }}
          >
            <Text className="text-xs font-bold" style={{ color: scoreColor }}>
              {Math.round(item.matchScore)}%
            </Text>
          </View>
        </View>

        {/* Matched Skills */}
        {item.matchedSkills?.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {item.matchedSkills.map(skill => (
              <View key={skill} className="bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                <CheckCircle size={10} color="#059669" />
                <Text className="text-xs font-medium text-green-700 dark:text-green-400">{skill}</Text>
              </View>
            ))}
            {item.missingSkills?.map(skill => (
              <View key={skill} className="bg-red-50 dark:bg-red-900/20 px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                <XCircle size={10} color="#dc2626" />
                <Text className="text-xs font-medium text-red-600 dark:text-red-400">{skill}</Text>
              </View>
            ))}
          </View>
        )}

        {item.reason ? (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic leading-4">{item.reason}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 dark:text-white">AI Candidate Matches</Text>
          {jobTitle ? (
            <Text className="text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>{jobTitle}</Text>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item, index) => item.candidateId?.toString() ?? index.toString()}
          renderItem={renderCandidateCard}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-full items-center justify-center mb-3">
                <Zap size={28} color="#7c3aed" />
              </View>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-center">No recommendations found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
