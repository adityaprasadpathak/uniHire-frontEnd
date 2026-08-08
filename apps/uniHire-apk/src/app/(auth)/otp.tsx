import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = () => {
    // Call backend API to verify OTP and reset password
    alert('Password reset successfully!');
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-zinc-950">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-blue-600 dark:text-blue-400">← Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify OTP</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        We sent a code to {email}.
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OTP Code</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
          placeholder="Enter 6-digit OTP"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      </View>
      
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</Text>
        <TextInput
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-black dark:text-white"
          placeholder="Enter new password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <TouchableOpacity
        onPress={handleResetPassword}
        className="w-full bg-blue-600 dark:bg-blue-500 rounded-lg py-3 flex-row justify-center items-center"
      >
        <Text className="text-white font-semibold text-lg">Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}
