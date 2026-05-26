"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 新增：条款勾选状态
  const [agreed, setAgreed] = useState(false);

  // Auto-fill referral code from URL parameter '?ref=...'
  const referralCodeFromUrl = searchParams.get('ref') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 8. 校验条款勾选
    if (!agreed) {
        alert("Please confirm you are over 18 years of age and agree to the Terms & Privacy Policy to proceed.");
        return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    // 7. 合并 First Name 和 Last Name 为后端需要的 'name'
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const fullName = `${firstName} ${lastName}`.trim();
    
    const data = {
        name: fullName,
        email: formData.get('email'),
        password: formData.get('password'),
        referralCode: formData.get('referralCode'),
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert('Registration successful! Please log in.');
        router.push('/login');
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-gray-500 text-sm mt-2">Join us for exclusive member benefits</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 7. 修改：拆分姓名字段 */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500 transition"
                    placeholder="John"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500 transition"
                    placeholder="Doe"
                />
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500 transition"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500 transition"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Referral Code (Optional)</label>
          <input
            name="referralCode"
            type="text"
            defaultValue={referralCodeFromUrl}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500 transition bg-gray-50"
            placeholder="e.g. REF-X82A"
          />
          {referralCodeFromUrl && (
            <p className="text-xs text-green-600 mt-1 font-medium">✓ Referral code applied</p>
          )}
        </div>

        {/* 8. 新增：条款勾选 Checkbox */}
        <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center h-5">
                <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
            </div>
            <div className="ml-0 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer select-none">
                    I confirm I am over 18 years of age and agree to the <span className="text-red-600">Terms & Privacy Policy</span>.
                </label>
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-100"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?
        <Link href="/login" className="text-red-600 font-bold hover:underline ml-1">
          Log In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        {/* Suspense is required for useSearchParams in Next.js 16 */}
        <Suspense fallback={<div className="text-gray-500">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}