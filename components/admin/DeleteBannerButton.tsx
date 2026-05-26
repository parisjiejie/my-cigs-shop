"use client";

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteBannerButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个轮播图吗？')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // 删除成功后刷新页面以更新列表
        window.location.reload();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="删除"
    >
      <Trash2 size={18} />
    </button>
  );
}