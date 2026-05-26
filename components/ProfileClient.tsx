"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 注意：这里只引入 useRouter，移除了 useSearchParams
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AddressManager from '@/components/AddressManager'; 
import CouponList from '@/components/CouponList'; 

const TABS = {
  DASHBOARD: 'Dashboard',
  ORDERS: 'Orders',
  ADDRESSES: 'Addresses',
  COUPONS: 'Coupons', 
  SECURITY: 'Security',
  REFERRAL: 'Referral',
};

// 子组件：修改密码表单
function ChangePasswordForm() {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Password updated successfully!');
                setFormData({ currentPassword: '', newPassword: '' });
            } else {
                setError(data.error || 'Failed to update password.');
            }
        } catch (e) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full border p-2 rounded-lg outline-none focus:border-red-500 transition"
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                        type="password" 
                        required 
                        minLength={6}
                        className="w-full border p-2 rounded-lg outline-none focus:border-red-500 transition"
                        value={formData.newPassword}
                        onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

// 接收服务端传来的 initialData 和 urlTab (通过 props 接收，而不是 hook)
export default function ProfileClient({ initialData, urlTab }: { initialData: any, urlTab: string | null }) {
  const router = useRouter();
  
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState(!initialData);
  
  // 使用 props 初始化 Tab
  const [activeTab, setActiveTab] = useState(urlTab || TABS.DASHBOARD); 

  // 监听 props 变化 (当 URL 改变时，Server Component 会重新渲染并传入新的 urlTab)
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  // 数据兜底加载 (双重保险)
  useEffect(() => {
    if (!initialData) {
        fetch('/api/user/profile')
        .then(res => {
            if (res.status === 401) router.push('/login');
            return res.json();
        })
        .then(json => {
            if (json.user) setData(json);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialData, router]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  if (!data?.user) return null;

  const { user, orders } = data;
  
  const renderContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Referral Code</p>
                <p className="text-2xl font-bold text-red-700">{user.referralCode || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Latest Order</p>
                <p className="text-2xl font-bold text-blue-700">{orders.length > 0 ? orders[0].orderNumber : 'No Orders'}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Welcome back. Manage your orders and addresses on the left.
            </p>
          </div>
        );
      
      case TABS.ORDERS:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Order History ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Order #</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${order.finalTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/order/${order.orderNumber}`} className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case TABS.ADDRESSES:
        // 确保 AddressManager 组件存在且路径正确
        return <AddressManager userId={user._id || user.id} userEmail={user.email} />; 
      
      case TABS.COUPONS:
        return <CouponList />; 

      case TABS.SECURITY:
        return <ChangePasswordForm />;

      case TABS.REFERRAL:
        router.push('/profile/referral'); 
        return null; 
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <nav className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-1">
              {Object.values(TABS).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                      if (tab === TABS.REFERRAL) {
                        router.push('/profile/referral');
                      } else {
                        // 使用 router.push 改变 URL，触发 Server Component 重写渲染
                        router.push(`/profile?tab=${tab}`); 
                        // 本地状态也更新，提升响应速度
                        setActiveTab(tab);
                      }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {/* 导航文字映射 */}
                  {tab === TABS.DASHBOARD && '🏠 Dashboard'}
                  {tab === TABS.ORDERS && '📄 My Orders'}
                  {tab === TABS.ADDRESSES && '📍 My Addresses'}
                  {tab === TABS.COUPONS && '💰 My Coupons'}
                  {tab === TABS.SECURITY && '🔒 Security'}
                  {tab === TABS.REFERRAL && '🎁 Referral'}
                </button>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}