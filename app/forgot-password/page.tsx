"use client";

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('If an account exists with that email, we have sent a reset link. Please check your inbox.');
      } else {
        setError(data.error || 'Request failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mb-6 text-center">Enter your email to receive a reset link.</p>

          {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">{message}</div>}
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:border-red-500"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-gray-600 hover:text-red-600 font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}