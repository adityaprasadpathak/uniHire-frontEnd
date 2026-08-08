import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../services/apiClient';

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'EMPLOYER' && !companyName.trim()) {
      setError('Company Name is required for Employers');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = role === 'EMPLOYER' ? '/auth/register/employer' : '/auth/register/candidate';
      const firstName = name.split(' ')[0] || name;
      const lastName = name.split(' ').slice(1).join(' ') || '';

      const payload = role === 'EMPLOYER' ? {
        companyName,
        email,
        password,
        name,
      } : {
        firstName,
        lastName,
        email,
        password,
        phone,
      };

      await apiClient.post(endpoint, payload);
      Alert.alert('Registration Successful', 'Your account has been created. Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      console.log('Register Error:', err);
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 bg-white dark:bg-zinc-950 py-10">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Create Account</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base">Sign up to get started with UniHire</Text>
      </View>

      {/* Role Switcher */}
      <View className="flex-row bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-xl mb-6 border border-slate-200 dark:border-zinc-800">
        <TouchableOpacity
          onPress={() => { setRole('CANDIDATE'); setError(''); }}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            role === 'CANDIDATE' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''
          }`}
        >
          <Text className={`text-sm font-bold ${role === 'CANDIDATE' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            Candidate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setRole('EMPLOYER'); setError(''); }}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            role === 'EMPLOYER' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''
          }`}
        >
          <Text className={`text-sm font-bold ${role === 'EMPLOYER' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            Employer
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
      ) : null}

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {role === 'EMPLOYER' ? 'Contact Name *' : 'Full Name *'}
        </Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm"
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />
      </View>

      {role === 'EMPLOYER' && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</Text>
          <TextInput
            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm"
            placeholder="e.g. Acme Corporation"
            placeholderTextColor="#9ca3af"
            value={companyName}
            onChangeText={setCompanyName}
          />
        </View>
      )}

      {role === 'CANDIDATE' && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</Text>
          <TextInput
            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm"
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm"
          placeholder="name@company.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm"
          placeholder="At least 6 characters"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 rounded-xl py-3.5 flex-row justify-center items-center mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-bold text-base">Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="py-2 items-center">
        <Text className="text-slate-600 dark:text-slate-400 text-sm">
          Already have an account? <Text className="text-blue-600 dark:text-blue-400 font-bold">Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
