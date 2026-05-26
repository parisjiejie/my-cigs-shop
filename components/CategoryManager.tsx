"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  order?: number;
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  
  // 核心状态
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  
  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', order: 0, slug: '' });

  // 排序后的列表 (客户端排序)
  const sortedCategories = useMemo(() => {
      // 按照 order 字段升序排列
      return categories.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const resetForm = () => {
      setEditingId(null);
      setFormData({ name: '', order: 0, slug: '' });
  };

  // 点击编辑按钮：填充表单
  const handleEditClick = (cat: Category) => {
      setEditingId(cat._id);
      setFormData({ name: cat.name, order: cat.order || 0, slug: cat.slug });
  };

  // 提交 (新增或更新)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        // 刷新整个页面以获取最新排序和数据
        router.refresh();
        resetForm();
        window.location.reload(); // 确保浏览器彻底刷新
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Operation failed');
      }
    } catch (error) {
      alert('Network error');
    }
    setLoading(false);
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products associated with it may be affected.')) return;
    
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // 从本地状态移除
        setCategories(categories.filter(c => c._id !== id));
        router.refresh();
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧：表单 (新增/编辑) */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '✏️ Edit Category' : '✨ Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                name="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Vapes"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order (Sort Index)</label>
              <input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 is highest priority).</p>
            </div>
            
            {editingId && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                    <input 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="e.g. vape-pens"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none"
                    />
                </div>
            )}

            <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  disabled={loading || !formData.name}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
                </button>
                {editingId && (
                    <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                )}
            </div>
          </form>
        </div>
      </div>

      {/* 右侧：列表 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between">
            <h2 className="text-lg font-semibold text-gray-800">All Collections ({categories.length})</h2>
            <span className="text-xs text-gray-500">Sorted by Order Index</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {sortedCategories.map((cat) => (
              <div key={cat._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group">
                <div className="flex items-center gap-4">
                  {/* 显示排序权重 */}
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {cat.order}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditClick(cat)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1.5 rounded hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-500 hover:text-red-700 text-sm px-3 py-1.5 rounded hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}