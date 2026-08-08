import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/apiClient';
import {
  User, Phone, Globe, Edit, FileText, Upload, CheckCircle2,
  Briefcase, GraduationCap, Award, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw, LogOut,
} from 'lucide-react-native';

interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  id: number;
  jobTitle: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Certification {
  id: number;
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
}

interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  languages?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  parsingStatus?: string;
  parsingFailureReason?: string;
  profileCompletionScore?: number;
  educations?: Education[];
  experiences?: Experience[];
  certifications?: Certification[];
}

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <View className="flex-row items-center gap-2 mb-4">
      {icon}
      <Text className="text-base font-bold text-slate-900 dark:text-white flex-1">{title}</Text>
      {count != null && (
        <View className="bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
          <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">{count}</Text>
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    logout();
    router.replace('/(auth)/login');
  };
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reparsing, setReparsing] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const [expandedEdu, setExpandedEdu] = useState<number | null>(null);

  const loadProfile = async () => {
    try {
      const res = await apiClient.get('/candidate/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        setUploading(true);
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);
        await apiClient.post('/candidate/profile/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Resume uploaded! Your profile is being parsed.');
        await loadProfile();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReparse = async () => {
    setReparsing(true);
    try {
      await apiClient.post('/candidate/profile/resume/reparse');
      Alert.alert('Success', 'Reparse job queued. Check back shortly!');
    } catch (err) {
      Alert.alert('Error', 'Failed to trigger reparse.');
    } finally {
      setReparsing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-zinc-950 px-6">
        <AlertCircle size={40} color="#ef4444" />
        <Text className="text-slate-600 dark:text-slate-400 text-center mt-3">
          Failed to load profile. Please try again.
        </Text>
        <TouchableOpacity onPress={loadProfile} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completion = profile.profileCompletionScore ?? 0;
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your Profile';
  const initials = (profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '') || '?';

  const parsingStatusColor =
    profile.parsingStatus === 'COMPLETED' ? '#059669'
    : profile.parsingStatus === 'FAILED' ? '#ef4444'
    : '#d97706';

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-zinc-950" contentContainerStyle={{ paddingBottom: 32 }}>

      {/* ── Avatar + Name + Edit ─────────────────────────────────────── */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-4 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4 flex-1">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-xl font-extrabold text-white uppercase">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</Text>
              {profile.email ? (
                <Text className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{profile.email}</Text>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(candidate)/edit-profile')}
            className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"
          >
            <Edit size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Profile Completion */}
        <View className="mt-4 bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">Profile Completion</Text>
            <Text className="text-xs font-bold text-blue-600">{completion}%</Text>
          </View>
          <View className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
            <View className="h-2 rounded-full bg-blue-600" style={{ width: `${completion}%` }} />
          </View>
        </View>

        {/* Contact info */}
        <View className="mt-4 gap-2">
          {profile.phone ? (
            <View className="flex-row items-center gap-2">
              <Phone size={15} color="#6b7280" />
              <Text className="text-sm text-slate-600 dark:text-slate-400">{profile.phone}</Text>
            </View>
          ) : null}
          {profile.languages ? (
            <View className="flex-row items-center gap-2">
              <Globe size={15} color="#6b7280" />
              <Text className="text-sm text-slate-600 dark:text-slate-400">Languages: {profile.languages}</Text>
            </View>
          ) : null}
          {profile.portfolioUrl ? (
            <View className="flex-row items-center gap-2">
              <Globe size={15} color="#2563eb" />
              <Text className="text-sm text-blue-600 dark:text-blue-400" numberOfLines={1}>{profile.portfolioUrl}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Resume ────────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <SectionHeader icon={<FileText size={18} color="#2563eb" />} title="Resume" />

        <View className="flex-row items-center bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 gap-3">
          <FileText size={28} color="#6b7280" />
          <View className="flex-1">
            {profile.resumeUrl ? (
              <>
                <Text className="text-sm font-semibold text-slate-800 dark:text-white">Resume Uploaded</Text>
                {profile.parsingStatus ? (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: parsingStatusColor }} />
                    <Text className="text-xs" style={{ color: parsingStatusColor }}>
                      {profile.parsingStatus}
                    </Text>
                  </View>
                ) : null}
                {profile.parsingFailureReason ? (
                  <Text className="text-xs text-red-500 mt-0.5" numberOfLines={2}>{profile.parsingFailureReason}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text className="text-sm font-semibold text-slate-800 dark:text-white">No resume uploaded</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload a PDF to auto-parse your profile</Text>
              </>
            )}
          </View>
          {profile.resumeUrl && <CheckCircle2 size={22} color="#059669" />}
        </View>

        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            onPress={handleResumeUpload}
            disabled={uploading}
            className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-blue-600 rounded-xl"
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Upload size={15} color="#fff" />}
            <Text className="text-white text-sm font-semibold">{uploading ? 'Uploading…' : 'Upload PDF'}</Text>
          </TouchableOpacity>

          {profile.resumeUrl ? (
            <TouchableOpacity
              onPress={handleReparse}
              disabled={reparsing}
              className="flex-row items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-zinc-700 rounded-xl"
            >
              {reparsing
                ? <ActivityIndicator size="small" color="#374151" />
                : <RefreshCw size={15} color="#374151" />}
              <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium">Reparse</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Skills ────────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <SectionHeader
          icon={<User size={18} color="#7c3aed" />}
          title="Skills"
          count={profile.skills?.length}
        />
        {profile.skills && profile.skills.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <View key={i} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                <Text className="text-blue-700 dark:text-blue-400 text-sm font-medium">{skill}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-slate-400 italic text-sm">No skills yet. Upload your resume to auto-populate.</Text>
        )}
      </View>

      {/* ── Experience ────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <SectionHeader
          icon={<Briefcase size={18} color="#059669" />}
          title="Work Experience"
          count={profile.experiences?.length}
        />
        {profile.experiences && profile.experiences.length > 0 ? (
          profile.experiences.map((exp, i) => (
            <TouchableOpacity
              key={exp.id ?? i}
              onPress={() => setExpandedExp(expandedExp === i ? null : i)}
              className="mb-3 border border-slate-100 dark:border-zinc-700 rounded-xl overflow-hidden"
            >
              <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800">
                <View className="flex-1 pr-2">
                  <Text className="font-semibold text-slate-900 dark:text-white" numberOfLines={1}>{exp.jobTitle}</Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{exp.company}</Text>
                  {exp.startDate ? (
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </Text>
                  ) : null}
                </View>
                {expandedExp === i
                  ? <ChevronUp size={16} color="#6b7280" />
                  : <ChevronDown size={16} color="#6b7280" />}
              </View>
              {expandedExp === i && exp.description ? (
                <View className="px-4 py-3 bg-white dark:bg-zinc-900">
                  <Text className="text-sm text-slate-600 dark:text-slate-400 leading-5">{exp.description}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-slate-400 italic text-sm">No experience added yet.</Text>
        )}
      </View>

      {/* ── Education ─────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
        <SectionHeader
          icon={<GraduationCap size={18} color="#d97706" />}
          title="Education"
          count={profile.educations?.length}
        />
        {profile.educations && profile.educations.length > 0 ? (
          profile.educations.map((edu, i) => (
            <TouchableOpacity
              key={edu.id ?? i}
              onPress={() => setExpandedEdu(expandedEdu === i ? null : i)}
              className="mb-3 border border-slate-100 dark:border-zinc-700 rounded-xl overflow-hidden"
            >
              <View className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800">
                <View className="flex-1 pr-2">
                  <Text className="font-semibold text-slate-900 dark:text-white" numberOfLines={1}>{edu.degree}</Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{edu.institution}</Text>
                  {edu.startDate ? (
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {edu.startDate} — {edu.endDate || 'Present'}
                    </Text>
                  ) : null}
                </View>
                {expandedEdu === i
                  ? <ChevronUp size={16} color="#6b7280" />
                  : <ChevronDown size={16} color="#6b7280" />}
              </View>
              {expandedEdu === i && edu.description ? (
                <View className="px-4 py-3 bg-white dark:bg-zinc-900">
                  <Text className="text-sm text-slate-600 dark:text-slate-400 leading-5">{edu.description}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-slate-400 italic text-sm">No education added yet.</Text>
        )}
      </View>

      {/* ── Certifications ────────────────────────────────────────────── */}
      {profile.certifications && profile.certifications.length > 0 ? (
        <View className="bg-white dark:bg-zinc-900 mx-4 mt-3 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
          <SectionHeader
            icon={<Award size={18} color="#7c3aed" />}
            title="Certifications"
            count={profile.certifications.length}
          />
          {profile.certifications.map((cert, i) => (
            <View
              key={cert.id ?? i}
              className="mb-3 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700"
            >
              <Text className="font-semibold text-slate-900 dark:text-white">{cert.name}</Text>
              {cert.issuingOrganization ? (
                <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{cert.issuingOrganization}</Text>
              ) : null}
              {cert.issueDate ? (
                <Text className="text-xs text-slate-400 mt-0.5">Issued: {cert.issueDate}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Logout Button ────────────────────────────────────────────── */}
      <View className="mx-4 mt-6 mb-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-3.5 rounded-2xl"
        >
          <LogOut size={18} color="#dc2626" />
          <Text className="text-red-600 dark:text-red-400 font-bold text-base">Logout</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
