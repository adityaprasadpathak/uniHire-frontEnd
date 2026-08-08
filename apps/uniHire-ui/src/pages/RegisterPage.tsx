import React, { useState } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useRHForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const payload = {
        role,
        name: data.name,
        email: data.email,
        password: data.password,
        ...(role === 'EMPLOYER' ? { companyName: data.companyName } : {}),
      };
      
      const endpoint = role === 'EMPLOYER' ? '/auth/register/employer' : '/auth/register/candidate';
      const response = await apiClient.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Registration failed';
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const { data } = await apiClient.post('/auth/oauth2/google', { idToken });
      return data;
    },
    onSuccess: (data) => {
      const user = { email: data.email, role: data.role };
      login(data.accessToken, user);
      navigate('/dashboard');
    },
    onError: () => {
      setErrorMsg('Google login failed');
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    if (role === 'EMPLOYER' && !data.companyName) {
      setErrorMsg('Company Name is required for Employers');
      return;
    }
    setErrorMsg('');
    registerMutation.mutate(data);
  };

  const handleRoleSwitch = (newRole: 'CANDIDATE' | 'EMPLOYER') => {
    setRole(newRole);
    setErrorMsg('');
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              role === 'CANDIDATE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => handleRoleSwitch('CANDIDATE')}
          >
            Candidate
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              role === 'EMPLOYER' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => handleRoleSwitch('EMPLOYER')}
          >
            Employer
          </button>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {role === 'EMPLOYER' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  {...register('companyName')}
                  type="text"
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  googleLoginMutation.mutate(credentialResponse.credential);
                }
              }}
              onError={() => {
                setErrorMsg('Google login failed');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
