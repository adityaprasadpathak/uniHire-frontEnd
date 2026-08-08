import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity,
  RefreshControl, ScrollView, TextInput,
} from 'react-native';
import apiClient from '../../services/apiClient';
import { User, MapPin, Mail, Sparkles, Search } from 'lucide-react-native';

interface Job {
  id: number;
  title: string;
}

interface RecommendedCandidate {
  candidateId: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  skills?: string[];
  topSkills?: string[];
  matchedSkills?: string[];
  matchScore?: number;
  similarityScore?: number;
}

export default function CandidatesScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<RecommendedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchJobsAndRecommendations = async () => {
    try {
      const jobsRes = await apiClient.get('/employer/jobs');
      const activeJobs = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.content ?? []);
      setJobs(activeJobs);

      if (activeJobs.length > 0) {
        const jobIdToUse = selectedJobId || activeJobs[0].id;
        if (!selectedJobId) setSelectedJobId(jobIdToUse);
        const candRes = await apiClient.get(`/recommendations/jobs/${jobIdToUse}/candidates`);
        const candData = Array.isArray(candRes.data) ? candRes.data : (candRes.data?.content ?? []);
        setCandidates(candData);
      }
    } catch (err) {
      console.log('Candidates fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobsAndRecommendations();
  }, [selectedJobId]);

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchJobsAndRecommendations();
      return;
    }
    setSearching(true);
    try {
      const res = await apiClient.get('/employer/candidates/search', {
        params: { query: query.trim(), topK: 10 },
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setCandidates(data);
    } catch (e) {
      console.log('Candidate AI search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobsAndRecommendations();
  }, [selectedJobId]);

  const renderCandidateCard = ({ item }: { item: RecommendedCandidate }) => {
    const displayName = item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Candidate';
    const rawScore = item.matchScore ?? (item.similarityScore != null ? item.similarityScore * 100 : 0);
    const score = Math.round(rawScore > 1 ? rawScore : rawScore * 100);
    const skillList = item.matchedSkills || item.topSkills || item.skills || [];

    return (
      <View className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm mb-3 border border-slate-100 dark:border-zinc-800">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-full justify-center items-center mr-3">
              <User color="#2563eb" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                {displayName}
              </Text>
              {item.email ? (
                <View className="flex-row items-center mt-0.5">
                  <Mail size={12} color="#6b7280" className="mr-1" />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs" numberOfLines={1}>{item.email}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View className="bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800 flex-row items-center gap-1">
            <Sparkles size={12} color="#059669" />
            <Text className="text-green-700 dark:text-green-400 text-xs font-bold">{score}% Match</Text>
          </View>
        </View>

        {item.location ? (
          <View className="flex-row items-center mb-2.5">
            <MapPin size={13} color="#6b7280" className="mr-1" />
            <Text className="text-slate-600 dark:text-slate-400 text-xs">{item.location}</Text>
          </View>
        ) : null}

        {skillList.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-1">
            {skillList.slice(0, 5).map((skill, idx) => (
              <View key={idx} className="bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                <Text className="text-slate-700 dark:text-slate-300 text-xs font-medium">{skill}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Candidates Search</Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Find best matching candidates for your jobs</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 mt-3 gap-2">
          <Search size={16} color="#9ca3af" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-white text-sm"
            placeholder="Search candidates by skill or description..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searching ? <ActivityIndicator size="small" color="#2563eb" /> : null}
        </View>
      </View>

      {/* Job Filter Tabs */}
      {jobs.length > 0 && (
        <View className="bg-white dark:bg-zinc-900 py-3 border-b border-slate-100 dark:border-zinc-800">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {jobs.map(job => (
              <TouchableOpacity
                key={job.id}
                onPress={() => { setQuery(''); setSelectedJobId(job.id); }}
                className={`px-3.5 py-1.5 rounded-full border ${
                  selectedJobId === job.id && !query
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <Text className={`text-xs font-semibold ${selectedJobId === job.id && !query ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {job.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item, index) => item.candidateId?.toString() ?? index.toString()}
          renderItem={renderCandidateCard}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
          }
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
                <User size={28} color="#9ca3af" />
              </View>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-center">No candidates found</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Try selecting another job posting or clearing search.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
