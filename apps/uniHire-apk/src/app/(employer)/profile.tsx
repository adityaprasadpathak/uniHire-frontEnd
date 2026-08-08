import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/apiClient';
import { Building2, Globe, MapPin, Edit, LogOut } from 'lucide-react-native';

interface EmployerProfile {
  companyName: string;
  website: string;
  description: string;
  location: string;
}

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    logout();
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get('/employer/profile');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950 px-4">
        <Text className="text-gray-500 dark:text-gray-400 text-center">Failed to load company profile. Please try again later.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-zinc-950 p-4">
      <View className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm mb-6">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg justify-center items-center mr-4">
              <Building2 color="#2563eb" size={24} />
            </View>
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                {profile.companyName}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(employer)/edit-profile')}
            className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"
          >
            <Edit size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <View className="space-y-3 mt-4">
          {profile.website && (
            <View className="flex-row items-center">
              <Globe size={18} color="#6b7280" className="mr-3" />
              <Text className="text-blue-600 dark:text-blue-400">{profile.website}</Text>
            </View>
          )}
          {profile.location && (
            <View className="flex-row items-center mt-2">
              <MapPin size={18} color="#6b7280" className="mr-3" />
              <Text className="text-gray-700 dark:text-gray-300">{profile.location}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm mb-6">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">About Company</Text>
        <Text className="text-gray-600 dark:text-gray-400 leading-6">
          {profile.description || 'No description provided.'}
        </Text>
      </View>

      {/* Log Out Button */}
      <View className="mb-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-3.5 rounded-xl"
        >
          <LogOut size={18} color="#dc2626" />
          <Text className="text-red-600 dark:text-red-400 font-bold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
