import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSendOTP = () => {
    // Call backend API to send OTP, then navigate to OTP verification screen
    router.push(`/(auth)/otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-zinc-950">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-blue-600 dark:text-blue-400">← Back to Login</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        Enter your email address and we'll send you an OTP to reset your password.
      </Text>

      <View className="mb-6">
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

      <TouchableOpacity
        onPress={handleSendOTP}
        className="w-full bg-blue-600 dark:bg-blue-500 rounded-lg py-3 flex-row justify-center items-center"
      >
        <Text className="text-white font-semibold text-lg">Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
