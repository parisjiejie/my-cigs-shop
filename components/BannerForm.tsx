"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BannerFormProps {
  initialData?: any;
}

export default function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    imageUrl: initialData?.imageUrl || '',
    linkUrl: initialData?.linkUrl || '',
    position: initialData?.position || 'home_top',
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData 
        ? `/api/admin/banners/${initialData._id}`
        : '/api/admin/banners';
      
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        router.push('/admin/banners'); // 成功后返回列表
        router.refresh();
      } else {
        alert('操作失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // 处理 Checkbox
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
      <div className="space-y-6">
        
        {/* 图片预览 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">图片链接 (必填)</label>
          <input 
            name="imageUrl" 
            value={formData.imageUrl} 
            onChange={handleChange} 
            required 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
            placeholder="https://..."
          />
          {formData.imageUrl && (
            <div className="mt-3 relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">标题 (可选)</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
              placeholder="例如: 夏季大促"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">显示位置</label>
            <select 
              name="position" 
              value={formData.position} 
              onChange={handleChange} 
              className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
            >
              <option value="home_top">首页顶部 (Top Banner)</option>
              <option value="home_middle">首页中部 (Middle)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">跳转链接 (可选)</label>
          <input 
            name="linkUrl" 
            value={formData.linkUrl} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
            placeholder="/product/marlboro-gold"
          />
        </div>

        <div className="flex items-center gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">排序 (越小越前)</label>
            <input 
              name="order" 
              type="number" 
              value={formData.order} 
              onChange={handleChange} 
              className="w-24 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input 
              type="checkbox" 
              name="isActive" 
              id="isActive"
              checked={formData.isActive} 
              onChange={handleChange} 
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer">启用此轮播图</label>
          </div>
        </div>

        <div className="pt-4 flex gap-4 border-t">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? '保存中...' : '保存轮播图'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            取消
          </button>
        </div>
      </div>
    </form>
  );
}