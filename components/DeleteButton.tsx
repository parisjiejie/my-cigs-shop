"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if(!confirm('确定删除这个产品吗？')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
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