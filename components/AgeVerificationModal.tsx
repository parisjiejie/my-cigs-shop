"use client";

import { useEffect, useState } from 'react';

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 检查本地是否有记录
    const isVerified = localStorage.getItem('age_verified');
    if (!isVerified) {
      setIsOpen(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setIsOpen(false);
  };

  const handleExit = () => {
    // 拒绝则跳转到 Google
    window.location.href = "https://www.google.com"; 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden border-t-4 border-red-600">
        <div className="p-8 text-center">
          <div className="mb-4 text-5xl">🔞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Age Verification Required</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            By Australian law, you must be 18 years or older to purchase tobacco products.<br/>
            Please confirm your age to proceed.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={handleVerify}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
            >
              I am 18 or older
            </button>
            <button 
              onClick={handleExit}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              I am NOT 18
            </button>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-400 uppercase">
            My Cigs Australia supports responsible smoking laws.
          </p>
        </div>
      </div>
    </div>
  );
}