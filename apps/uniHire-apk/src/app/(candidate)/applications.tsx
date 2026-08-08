import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import apiClient from '../../services/apiClient';
import {
  Building2, MapPin, Calendar, Clock, Zap,
} from 'lucide-react-native';

interface Application {
  id: number;
  jobId?: number;
  jobTitle: string;
  companyName?: string;
  location?: string;
  appliedAt: string;
  status: string;
  aiMatchScore?: number;
  aiFitAnalysis?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPLIED:              { bg: '#dbeafe', text: '#1d4ed8' },
  SHORTLISTED:          { bg: '#d1fae5', text: '#065f46' },
  INTERVIEW_SCHEDULED:  { bg: '#fef3c7', text: '#92400e' },
  OFFERED:              { bg: '#ede9fe', text: '#5b21b6' },
  HIRED:                { bg: '#d1fae5', text: '#065f46' },
  REJECTED:             { bg: '#fee2e2', text: '#991b1b' },
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/candidate/applications');
      const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
      setApplications(data);
    } catch (e) {
      console.log('Applications fetch error:', e);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  const renderCard = ({ item }: { item: Application }) => {
    const colors = STATUS_COLORS[item.status] ?? { bg: '#f1f5f9', text: '#475569' };
    const statusLabel = item.status.replace(/_/g, ' ');

    return (
      <View className="bg-white dark:bg-zinc-900 mx-4 mb-3 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
        {/* Header */}
        <View className="flex-row justify-between items-start gap-2">
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={2}>
              {item.jobTitle}
            </Text>

            <View className="flex-row flex-wrap gap-3 mt-2">
              <View className="flex-row items-center gap-1.5">
                <Building2 size={13} color="#9ca3af" />
                <Text className="text-sm text-slate-600 dark:text-slate-400">
                  {item.companyName || 'Company'}
                </Text>
              </View>
              {item.location ? (
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={13} color="#9ca3af" />
                  <Text className="text-sm text-slate-500 dark:text-slate-400">{item.location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Status Badge */}
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: colors.bg }}
          >
            <Text className="text-xs font-semibold capitalize" style={{ color: colors.text }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View className="flex-row gap-4 mt-3">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={12} color="#9ca3af" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Applied {new Date(item.appliedAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock size={12} color="#9ca3af" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Status: <Text className="font-semibold text-slate-700 dark:text-slate-300">{statusLabel}</Text>
            </Text>
          </View>
        </View>

        {/* AI Match Score */}
        {item.aiMatchScore != null && (
          <View
            className="mt-3 p-3 rounded-xl flex-row gap-2"
            style={{ backgroundColor: '#f5f3ff' }}
          >
            <Zap size={16} color="#7c3aed" />
            <View className="flex-1">
              <Text className="text-xs font-bold" style={{ color: '#4c1d95' }}>
                AI Match Score: {item.aiMatchScore}%
              </Text>
              {item.aiFitAnalysis ? (
                <Text className="text-xs mt-0.5 leading-4" style={{ color: '#6d28d9' }}>
                  {item.aiFitAnalysis}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">My Applications</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Track your job applications and their status.
        </Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        ListEmptyComponent={
          <View className="items-center mt-20 px-8">
            <View className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
              <Building2 size={32} color="#9ca3af" />
            </View>
            <Text className="text-slate-600 dark:text-slate-400 font-semibold text-center">No applications yet</Text>
            <Text className="text-slate-400 text-sm text-center mt-1">
              Browse jobs and apply to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}
