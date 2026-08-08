import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  TextInput, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';
import { Search, MapPin, Clock, Building, Briefcase, Star } from 'lucide-react-native';

interface Job {
  id: number;
  title: string;
  description?: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  department?: string;
  employer?: { companyName: string };
  status?: string;
  publishedAt?: string;
}

interface PageData {
  content: Job[];
  totalPages: number;
  number: number;
}

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchJobs = useCallback(async (search: string, pageNum: number, append = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      // Matches exactly what the web UI sends: /public/jobs?keyword=...&page=...&size=...
      const params: any = { page: pageNum, size: 20 };
      if (search.trim()) params.keyword = search.trim();

      const res = await apiClient.get('/public/jobs', { params });
      const data: PageData = res.data;
      // Backend returns a Spring Page object: { content: [], totalPages: N, ... }
      const content = Array.isArray(data) ? data : (data?.content ?? []);

      if (append) {
        setJobs(prev => [...prev, ...content]);
      } else {
        setJobs(content);
      }
      setTotalPages(data?.totalPages ?? 1);
      setPage(pageNum);
    } catch (e: any) {
      console.log('Jobs fetch error:', e?.response?.status, e?.message);
      if (!append) setJobs([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs('', 0);
  }, []);

  const onSearch = () => {
    setPage(0);
    fetchJobs(query, 0);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(query, 0);
  };

  const loadMore = () => {
    if (loadingMore || page + 1 >= totalPages) return;
    fetchJobs(query, page + 1, true);
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(candidate)/job-detail', params: { id: String(item.id) } })}
      className="bg-white dark:bg-zinc-900 mx-4 mb-3 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={2}>{item.title}</Text>
          <View className="flex-row items-center gap-1.5 mt-1.5">
            <Building size={14} color="#6b7280" />
            <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {(item as any).companyName || item.employer?.companyName || 'Company'}
            </Text>
          </View>
        </View>
        {item.employmentType ? (
          <View className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
            <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">{item.employmentType}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row flex-wrap gap-3 mt-1">
        {item.location ? (
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color="#9ca3af" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">{item.location}</Text>
          </View>
        ) : null}
        {item.department ? (
          <View className="flex-row items-center gap-1">
            <Briefcase size={13} color="#9ca3af" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">{item.department}</Text>
          </View>
        ) : null}
        {item.salary ? (
          <View className="flex-row items-center gap-1">
            <Star size={13} color="#9ca3af" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">{item.salary}</Text>
          </View>
        ) : null}
      </View>

      {item.description ? (
        <Text className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-4" numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View className="mt-3 pt-3 border-t border-slate-50 dark:border-zinc-800 flex-row justify-between items-center">
        {item.publishedAt ? (
          <Text className="text-xs text-slate-400">
            Posted {new Date(item.publishedAt).toLocaleDateString()}
          </Text>
        ) : <View />}
        <View className="bg-violet-600 px-3 py-1.5 rounded-lg">
          <Text className="text-xs text-white font-semibold">View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Search Bar */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
        <View className="flex-row items-center bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 gap-3">
          <Search size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-white text-sm"
            placeholder="Search jobs, skills, companies..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); fetchJobs('', 0); }}>
              <Text className="text-slate-400 text-sm">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          renderItem={renderJobCard}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#2563eb" style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View className="items-center mt-16 px-8">
              <View className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
                <Briefcase size={32} color="#9ca3af" />
              </View>
              <Text className="text-slate-600 dark:text-slate-400 font-semibold text-center">No jobs found</Text>
              <Text className="text-slate-400 text-sm text-center mt-1">Try a different search term.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
