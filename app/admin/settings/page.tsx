"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 配置状态
  const [formData, setFormData] = useState({
    theme: 'simple',
    siteName: 'My Cigs Australia',
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: '',
  });

  // 1. 加载当前配置
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            theme: data.theme || 'simple',
            siteName: data.siteName || 'My Cigs Australia',
            smtpHost: data.smtpHost || '',
            smtpPort: data.smtpPort || 465,
            smtpUser: data.smtpUser || '',
            smtpPassword: data.smtpPassword || '',
            smtpFrom: data.smtpFrom || '',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. 保存配置
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
        router.refresh();
      } else {
        alert('Failed to save settings.');
      }
    } catch (e) {
      alert('Network error.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Manage website appearance and email configuration</p>
      </div>

      {/* --- 主题设置 --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">🎨 Theme Selection</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Theme */}
          <div 
            onClick={() => setFormData({...formData, theme: 'simple'})}
            className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:shadow-md ${
              formData.theme === 'simple' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'
            }`}
          >
            <div className="h-24 bg-white border border-gray-200 rounded-lg mb-4 flex items-center justify-center text-3xl">🛒</div>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Simple Ecommerce</h3>
              {formData.theme === 'simple' && <span className="text-blue-600 text-sm font-bold">● Active</span>}
            </div>
          </div>

          {/* Brand Theme */}
          <div 
            onClick={() => setFormData({...formData, theme: 'brand'})}
            className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:shadow-md ${
              formData.theme === 'brand' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-200'
            }`}
          >
            <div className="h-24 bg-gray-900 rounded-lg mb-4 flex items-center justify-center text-3xl">💎</div>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Brand Luxury</h3>
              {formData.theme === 'brand' && <span className="text-purple-600 text-sm font-bold">● Active</span>}
            </div>
          </div>
        </div>
      </div>

      {/* --- 邮件配置 (新增) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">📧 SMTP Email Configuration</h2>
          <p className="text-xs text-gray-500 mt-1">Configure your own email server to send notifications.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Host</label>
              <input 
                name="smtpHost" 
                value={formData.smtpHost} 
                onChange={handleChange}
                placeholder="e.g. smtp.gmail.com" 
                className="w-full border p-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Port</label>
              <input 
                name="smtpPort" 
                type="number"
                value={formData.smtpPort} 
                onChange={handleChange}
                placeholder="465 or 587" 
                className="w-full border p-2 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email User</label>
              <input 
                name="smtpUser" 
                value={formData.smtpUser} 
                onChange={handleChange}
                placeholder="your-email@example.com" 
                className="w-full border p-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Password</label>
              <input 
                name="smtpPassword" 
                type="password"
                value={formData.smtpPassword} 
                onChange={handleChange}
                placeholder="App password or Email password" 
                className="w-full border p-2 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">If using Gmail, use an "App Password".</p>
            </div>
          </div>

          <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sender Name (Optional)</label>
              <input 
                name="smtpFrom" 
                value={formData.smtpFrom} 
                onChange={handleChange}
                placeholder='"My Cigs Support" <support@mycigsaustralia.com>' 
                className="w-full border p-2 rounded-lg"
              />
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}