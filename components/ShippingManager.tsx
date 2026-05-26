"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  description: string;
  order: number;
  isActive: boolean;
}

export default function ShippingManager({ initialData }: { initialData: ShippingMethod[] }) {
  const router = useRouter();
  const [methods, setMethods] = useState<ShippingMethod[]>(initialData);
  const [loading, setLoading] = useState(false);
  
  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: 0, description: '', order: 0, isActive: true });

  const resetForm = () => {
      setEditingId(null);
      setFormData({ name: '', price: 0, description: '', order: 0, isActive: true });
  };

  const handleEditClick = (item: ShippingMethod) => {
      setEditingId(item._id);
      setFormData({ 
        name: item.name, 
        price: item.price, 
        description: item.description || '', 
        order: item.order || 0,
        isActive: item.isActive 
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/shipping-methods/${editingId}` : '/api/admin/shipping-methods';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        router.refresh();
        resetForm();
        window.location.reload(); 
      } else {
        alert('Operation failed');
      }
    } catch (error) {
      alert('Network error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipping method?')) return;
    try {
      const res = await fetch(`/api/admin/shipping-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMethods(methods.filter(m => m._id !== id));
        router.refresh();
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧：表单 */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '✏️ Edit Method' : '✨ Add Method'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Express Post"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Time)</label>
              <input 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g. 1-2 Business Days"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input 
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  disabled={loading || !formData.name}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Add')}
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
            <h2 className="text-lg font-semibold text-gray-800">Shipping Methods</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {methods.map((m) => (
              <div key={m._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-gray-100 text-gray-600 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {m.order}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{m.name} - ${m.price.toFixed(2)}</h3>
                    <p className="text-xs text-gray-400">{m.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditClick(m)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1.5 rounded hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(m._id)}
                    className="text-red-500 hover:text-red-700 text-sm px-3 py-1.5 rounded hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {methods.length === 0 && <div className="p-8 text-center text-gray-400">No shipping methods found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}