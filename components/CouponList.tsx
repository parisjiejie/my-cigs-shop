"use client";

import { useState, useEffect, useMemo } from 'react';

interface Coupon {
  _id: string;
  code: string;
  discountAmount: number;
  minOrderAmount: number;
  expiresAt: string;
  isUsed: boolean;
}

export default function CouponList() {
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'available' | 'used' | 'expired'>('available');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch('/api/user/coupons');
        if (res.status === 401) return;
        
        const data = await res.json();
        if (res.ok) {
          // 确保数据是数组
          setAllCoupons(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // 核心过滤逻辑：在客户端根据状态和过期时间进行分类
  const filteredCoupons = useMemo(() => {
      return allCoupons.filter(c => {
          const isExpired = new Date(c.expiresAt) < new Date();
          
          if (filter === 'available') {
              // 待使用：未被使用 且 未过期 (按照到期时间顺序排序)
              return !c.isUsed && !isExpired;
          }
          if (filter === 'used') {
              // 已使用
              return c.isUsed;
          }
          if (filter === 'expired') {
              // 已过期：未被使用 且 已过期
              return isExpired && !c.isUsed;
          }
          return false;
      }).sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()); // 按过期时间排序
  }, [allCoupons, filter]);

  if (loading) {
    return <div className="text-gray-500 text-center py-10">Loading coupons...</div>;
  }

  const tabClasses = (tab: string) => 
      `flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${
          filter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`;
      
  const itemStyle = (status: string) => {
      if (status === 'available') return 'bg-white border-green-200 shadow-sm text-green-600';
      if (status === 'used') return 'bg-gray-50 border-gray-300 opacity-60 text-gray-500';
      if (status === 'expired') return 'bg-red-50 border-red-200 opacity-80 text-red-600';
      return '';
  };


  return (
    <div className="space-y-6">
      {/* Tabs - 注意手机排版 flex-1 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full md:w-fit overflow-x-auto">
          {/* 手机端 flex-1 实现自适应宽度 */}
          {['available', 'used', 'expired'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={tabClasses(t)}
              >
                  {t === 'available' ? 'Available' : t === 'used' ? 'Used' : 'Expired'} ({allCoupons.filter(c => {
                    const isExpired = new Date(c.expiresAt) < new Date();
                    if (t === 'available') return !c.isUsed && !isExpired;
                    if (t === 'used') return c.isUsed;
                    if (t === 'expired') return isExpired && !c.isUsed;
                    return false;
                  }).length})
              </button>
          ))}
      </div>
      
      {filteredCoupons.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-gray-500">No {filter} coupons found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCoupons.map((coupon) => (
            <div 
              key={coupon._id} 
              // 应用样式
              className={`p-5 rounded-xl border flex flex-col justify-between relative overflow-hidden ${itemStyle(filter)}`}
            >
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`text-3xl font-extrabold ${filter === 'available' ? 'text-green-600' : 'text-gray-500'}`}>
                  ${coupon.discountAmount.toFixed(2)} OFF
                </div>
                <div className="font-mono text-xs px-3 py-1 rounded-full uppercase bg-white/50 text-gray-800">
                  {coupon.code}
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <p className="font-medium">Valid on orders over: ${coupon.minOrderAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}