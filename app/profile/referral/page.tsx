"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // 1. 设置域名
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    // 2. 获取用户信息
    fetch('/api/user/profile')
      .then(res => {
          if (res.status === 401) {
              router.push('/login');
              return;
          }
          return res.json();
      })
      .then(data => {
        if (data && data.user) setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="text-gray-500">Loading referral info...</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center flex-col gap-4">
      <p>Authentication failed. Please log in.</p>
      <Link href="/login" className="text-blue-600 underline">Go to Login</Link>
    </div>
  );

  const referralLink = `${origin}/register?ref=${user.referralCode || 'ERROR'}`;

  // 增强版复制功能
  const copyToClipboard = async () => {
    const link = referralLink;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (err) {
      // Fallback for security-restricted environments
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/profile" className="hover:text-gray-900">My Account</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Referral Program</span>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header Card */}
          <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-lg mb-8">
            <h1 className="text-3xl font-bold mb-2">Invite Friends, Earn Rewards</h1>
            <p className="opacity-90 text-lg">You and your friend each get 5 x $10 coupons!</p>
          </div>

          {/* Referral Tools */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            
            {/* 1. Your Code */}
            <div className="mb-8 text-center">
              <p className="text-gray-500 mb-2 uppercase tracking-wide text-xs font-bold">Your Unique Referral Code</p>
              <div className="text-4xl font-mono font-bold text-gray-900 tracking-wider">
                {user.referralCode || <span className="text-red-500 text-sm">N/A</span>}
              </div>
            </div>

            <hr className="border-gray-100 my-8" />

            {/* 2. Exclusive Link */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Exclusive Referral Link</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={referralLink} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600 font-mono text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={copyToClipboard}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition-all min-w-[100px] shadow-sm ${
                    copied ? 'bg-green-600 scale-95' : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* 3. QR Code */}
            <div className="flex flex-col items-center">
              <p className="text-sm font-bold text-gray-700 mb-4">In-Person QR Code</p>
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
                {user.referralCode && <QRCodeSVG value={referralLink} size={160} />}
              </div>
              <p className="text-xs text-gray-400 mt-3">Scan to register and link your account.</p>
            </div>
            
            <hr className="border-gray-100 my-8" />

            {/* 4. Rules Summary */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Coupon Rules</h3>
            <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                    <span className="text-green-600">✓</span> 
                    Discount: $10 OFF per coupon.
                </li>
                <li className="flex gap-2">
                    <span className="text-green-600">✓</span> 
                    Minimum Order: Must spend $100 or more (per coupon use).
                </li>
                <li className="flex gap-2">
                    <span className="text-green-600">✓</span> 
                    Limit: Maximum 1 coupon ($10) per single order.
                </li>
                <li className="flex gap-2">
                    <span className="text-green-600">✓</span> 
                    {/* 修改：有效期更新为 90 天 */}
                    Expiry: Each coupon expires 90 days after issuance.
                </li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
}