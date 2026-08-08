import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, userId, role, email: userEmail } = response.data;
      
      await SecureStore.setItemAsync('token', accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }
      
      const userPayload = {
        id: userId,
        email: userEmail,
        role: role,
        profileId: null,
      };

      await SecureStore.setItemAsync('user', JSON.stringify(userPayload));
      setUser(userPayload);

      // Role-based redirect is handled automatically by _layout.tsx
    } catch (err: any) {
      console.log('Login Error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-zinc-950">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">UniHire</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-lg">Sign in to continue</Text>
      </View>

      {error ? (
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
      ) : null}

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
          placeholder="Enter your password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="mt-2 self-end">
          <Text className="text-blue-600 dark:text-blue-400 text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 dark:bg-blue-500 rounded-lg py-3 flex-row justify-center items-center mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white font-semibold text-lg">Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')} className="py-2 items-center">
        <Text className="text-slate-600 dark:text-slate-400 text-sm">
          Don't have an account? <Text className="text-blue-600 dark:text-blue-400 font-bold">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
