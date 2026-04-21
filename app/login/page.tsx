'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Login error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-2">Log in to your account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-bold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-100"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?
        <Link href="/register" className="text-red-600 font-bold hover:underline ml-1">
          Sign Up Free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}