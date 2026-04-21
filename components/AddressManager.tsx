"use client";

import { useState, useEffect, useCallback } from 'react';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  postcode: string;
  isDefault: boolean;
}

export default function AddressManager({ userId, userEmail }: { userId: string, userEmail: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // 1. 获取地址列表
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/address');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 2. 删除地址
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await fetch(`/api/user/address/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  // 3. 设为默认地址
  const handleSetDefault = async (id: string) => {
    try {
        const res = await fetch(`/api/user/address/${id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDefault: true })
        });
        if (res.ok) fetchAddresses();
    } catch (e) {
        alert('Network error');
    }
  };

  // 打开新增窗口
  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  }

  // 打开编辑窗口
  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowForm(true);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">📍 My Addresses ({addresses.length})</h2>
        <button 
          onClick={handleAddNew}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-bold transition"
        >
          + Add New Address
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading...</div>
      ) : addresses.length === 0 ? (
        <div className="text-gray-500 text-center py-10 border border-dashed border-gray-300 rounded-lg">
            You haven't saved any addresses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className={`p-4 rounded-xl border transition-all ${addr.isDefault ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-gray-900">{addr.fullName}</p>
                {addr.isDefault && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold uppercase">Default</span>
                )}
              </div>
              
              <p className="text-sm text-gray-700">{addr.addressLine1}, {addr.city} {addr.state} {addr.postcode}</p>
              <p className="text-sm text-gray-500 mt-1">
                 Phone: {addr.phone} <span className="mx-2">|</span> Email: {addr.email}
              </p>
              
              <div className="mt-3 flex gap-4 text-xs font-medium border-t pt-3">
                <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(addr._id)} className="text-red-500 hover:underline">Delete</button>
                {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="text-gray-500 hover:text-blue-600 hover:underline">Set as Default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showForm && (
        <AddressFormModal 
            defaultEmail={userEmail} 
            initialData={editingAddress}
            onClose={() => setShowForm(false)} 
            onSave={fetchAddresses} 
        />
      )}
    </div>
  );
}

// ----------------------------------------
// 地址表单 Modal 组件
// ----------------------------------------

function AddressFormModal({ defaultEmail, initialData, onClose, onSave }: { defaultEmail: string; initialData: Address | null; onClose: () => void; onSave: () => void }) {
    // 关键修复：确保编辑时回显数据，新增时使用默认邮箱
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '', 
        phone: initialData?.phone || '', 
        email: initialData?.email || defaultEmail, 
        addressLine1: initialData?.addressLine1 || '', 
        city: initialData?.city || '', 
        state: initialData?.state || 'NSW', 
        postcode: initialData?.postcode || '', 
        isDefault: initialData?.isDefault || false
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let res;
            if (initialData) {
                // 编辑模式：PUT
                res = await fetch(`/api/user/address/${initialData._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                // 新增模式：POST
                res = await fetch('/api/user/address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            if (res.ok) {
                onSave(); 
                onClose(); 
            } else {
                alert('Failed to save address');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b pb-3">
                        {initialData ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full border p-2.5 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full border p-2.5 rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address (For Notifications)</label>
                        <input 
                            name="email" 
                            type="email"
                            required 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="w-full border p-2.5 rounded-lg bg-gray-50 focus:bg-white transition" 
                        />
                        <p className="text-xs text-gray-500 mt-1">This email will be used for shipping updates for orders using this address.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Street Address</label>
                        <input name="addressLine1" required value={formData.addressLine1} onChange={handleChange} className="w-full border p-2.5 rounded-lg" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input name="city" required value={formData.city} onChange={handleChange} className="w-full border p-2.5 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Postcode</label>
                            <input name="postcode" required value={formData.postcode} onChange={handleChange} className="w-full border p-2.5 rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <select name="state" required onChange={handleChange} value={formData.state} className="w-full border p-2.5 rounded-lg bg-white">
                            <option value="NSW">NSW</option><option value="VIC">VIC</option><option value="QLD">QLD</option>
                            <option value="WA">WA</option><option value="SA">SA</option><option value="TAS">TAS</option><option value="ACT">ACT</option><option value="NT">NT</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleChange} className="text-red-600 rounded" />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Set as default address</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}