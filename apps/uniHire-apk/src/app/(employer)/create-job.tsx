import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react-native';

export default function CreateJobScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [salary, setSalary] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a job title');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        department,
        location,
        employmentType,
        workMode,
        salary,
        skills,
        description,
        responsibilities,
      };

      const res = await apiClient.post('/employer/jobs', payload);
      const createdJob = res.data;

      if (publish && createdJob?.id) {
        await apiClient.put(`/employer/jobs/${createdJob.id}/status`, { status: 'PUBLISHED' });
      }

      Alert.alert('Success', publish ? 'Job published successfully!' : 'Job saved as draft!');
      router.replace('/(employer)/dashboard');
    } catch (e: any) {
      console.log('Create job error:', e);
      Alert.alert('Error', e.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="bg-white dark:bg-zinc-900 px-4 py-4 border-b border-slate-100 dark:border-zinc-800 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">Create New Job</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Basic Details */}
        <View className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-4">
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-4">Basic Information</Text>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="e.g. Senior Software Engineer"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="e.g. Engineering, Marketing"
              placeholderTextColor="#9ca3af"
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="e.g. New York, NY or Remote"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Range</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="e.g. $100k - $130k / year"
              placeholderTextColor="#9ca3af"
              value={salary}
              onChangeText={setSalary}
            />
          </View>
        </View>

        {/* Employment Type & Work Mode */}
        <View className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-4">
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">Job Type & Mode</Text>

          <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Employment Type</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setEmploymentType(type)}
                className={`px-3 py-2 rounded-xl border ${
                  employmentType === type
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    employmentType === type ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Work Mode</Text>
          <View className="flex-row flex-wrap gap-2">
            {['REMOTE', 'HYBRID', 'ON_SITE'].map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setWorkMode(mode)}
                className={`px-3 py-2 rounded-xl border ${
                  workMode === mode
                    ? 'bg-violet-600 border-violet-600'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    workMode === mode ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skills & Details */}
        <View className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mb-4">
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-4">Requirements & Skills</Text>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma-separated)</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
              placeholderTextColor="#9ca3af"
              value={skills}
              onChangeText={setSkills}
            />
          </View>

          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Description</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="Describe the job role, goals, and team culture..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Responsibilities</Text>
            <TextInput
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
              placeholder="List key responsibilities..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={responsibilities}
              onChangeText={setResponsibilities}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 px-4 py-4 border-t border-slate-100 dark:border-zinc-800 flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleSubmit(false)}
          disabled={loading}
          className="flex-1 py-3.5 bg-slate-100 dark:bg-zinc-800 rounded-xl items-center"
        >
          <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSubmit(true)}
          disabled={loading}
          className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center flex-row justify-center gap-2"
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : null}
          <Text className="text-white font-bold text-sm">Publish Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
