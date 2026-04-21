"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteBannerButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // 增加确认提示
    if(!confirm('确定删除这张轮播图吗？')) return;
    
    setLoading(true);
    try {
      // 调用删除 API
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        // 删除成功后刷新页面数据
        router.refresh();
      } else {
        alert('删除失败');
      }
    } catch (e) {
      console.error(e);
      alert('删除出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 transition-colors"
    >
      {loading ? '...' : '删除'}
    </button>
  );
}