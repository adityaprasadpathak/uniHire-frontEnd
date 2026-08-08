import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';

interface CompanyFormData {
  companyName: string;
  website: string;
  location: string;
  description: string;
}

export default function EditCompanyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, reset } = useForm<CompanyFormData>();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get('/employer/profile');
        const data = res.data;
        reset({
          companyName: data.companyName || '',
          website: data.website || '',
          location: data.location || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true);
    try {
      await apiClient.put('/employer/profile', data);
      router.back();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950 px-4 pt-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-blue-600 dark:text-blue-400">← Cancel</Text>
      </TouchableOpacity>
      
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Company Profile</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</Text>
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</Text>
        <Controller
          control={control}
          name="website"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
              value={value}
              onChangeText={onChange}
              keyboardType="url"
              autoCapitalize="none"
            />
          )}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</Text>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </View>

      <View className="mb-8">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={saving}
        className="w-full bg-blue-600 dark:bg-blue-500 rounded-lg py-3 flex-row justify-center items-center mb-10"
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-lg">Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
