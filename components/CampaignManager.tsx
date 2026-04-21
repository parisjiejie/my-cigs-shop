"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义接口
interface Product {
  _id: string;
  name: string;
  categoryName: string;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  type: 'buy_x_get_y' | 'tiered_discount' | 'free_shipping';
  isActive: boolean;
  scope: 'all' | 'specific';
  targetProducts: string[];
  rules: {
    buyQuantity: number;
    getQuantity: number;
    minSpend: number;
    discountAmount: number;
    freeShippingThreshold: number;
  };
  startDate: string;
  endDate: string;
}

interface CampaignFormState {
  name: string;
  description: string;
  type: 'buy_x_get_y' | 'tiered_discount' | 'free_shipping';
  isActive: boolean;
  scope: 'all' | 'specific';
  targetProducts: string[];
  rules: {
    buyQuantity: number;
    getQuantity: number;
    minSpend: number;
    discountAmount: number;
    freeShippingThreshold: number;
  };
  startDate: string;
  endDate: string;
}

export default function CampaignManager({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [products, setProducts] = useState<Product[]>([]); 
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 产品搜索词
  const [productSearch, setProductSearch] = useState('');
  // 🆕 产品加载错误状态
  const [productLoadError, setProductLoadError] = useState('');

  const initialFormState: CampaignFormState = {
    name: '',
    description: '',
    type: 'buy_x_get_y',
    isActive: true,
    scope: 'all',
    targetProducts: [],
    rules: {
      buyQuantity: 5,
      getQuantity: 1,
      minSpend: 300,
      discountAmount: 20,
      freeShippingThreshold: 300
    },
    startDate: '',
    endDate: ''
  };

  const [formData, setFormData] = useState<CampaignFormState>(initialFormState);

  // 1. 加载产品列表 (带错误提示)
  useEffect(() => {
    if (showForm && products.length === 0) {
        setProductLoadError('');
        // 尝试调用 API
        // 修复：添加时间戳参数 ?t=... 强制浏览器不使用缓存，确保获取最新数据
        fetch(`/api/admin/product/list?t=${new Date().getTime()}`) 
        .then(res => {
            if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(data => {
             if (Array.isArray(data)) {
                 setProducts(data);
             } else {
                 setProductLoadError('Invalid data format from server');
             }
        })
        .catch(err => {
            console.error("Error loading products:", err);
            setProductLoadError(err.message || 'Failed to load products');
        });
    }
  }, [showForm]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
    setProductSearch('');
    setProductLoadError('');
  };

  const handleEdit = (camp: Campaign) => {
    setEditingId(camp._id);
    setFormData({
        name: camp.name,
        description: camp.description || '',
        type: camp.type,
        isActive: camp.isActive,
        scope: camp.scope,
        targetProducts: camp.targetProducts || [],
        rules: {
            buyQuantity: camp.rules?.buyQuantity || 5,
            getQuantity: camp.rules?.getQuantity || 1,
            minSpend: camp.rules?.minSpend || 300,
            discountAmount: camp.rules?.discountAmount || 20,
            freeShippingThreshold: camp.rules?.freeShippingThreshold || 300
        },
        startDate: camp.startDate ? new Date(camp.startDate).toISOString().slice(0, 16) : '',
        endDate: camp.endDate ? new Date(camp.endDate).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
    router.refresh();
    setCampaigns(campaigns.filter(c => c._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : '/api/admin/campaigns';
      const method = editingId ? 'PUT' : 'POST';

      // 处理日期：如果是空字符串，转为 null 发送给后端
      const payload = {
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh();
        resetForm();
        window.location.reload(); 
      } else {
        alert('Failed to save campaign');
      }
    } catch (error) {
      alert('Network error');
    }
    setLoading(false);
  };

  // 过滤产品列表
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.categoryName.toLowerCase().includes(productSearch.toLowerCase())
  );

  const renderRuleInputs = () => {
    switch (formData.type) {
      case 'buy_x_get_y':
        return (
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <label className="block text-xs font-bold text-blue-800 mb-1">Buy Quantity (X)</label>
              <input 
                type="number" 
                value={formData.rules.buyQuantity}
                onChange={e => setFormData({...formData, rules: {...formData.rules, buyQuantity: Number(e.target.value)}})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-800 mb-1">Get Free (Y)</label>
              <input 
                type="number" 
                value={formData.rules.getQuantity}
                onChange={e => setFormData({...formData, rules: {...formData.rules, getQuantity: Number(e.target.value)}})}
                className="w-full border p-2 rounded"
              />
            </div>
            <p className="col-span-2 text-xs text-blue-600">
              Same Product Rule: Buy 5 Get 1 Free = Customer pays for 5, gets 6. Inventory decreases by 6.
            </p>
          </div>
        );
      case 'tiered_discount':
        return (
          <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
             <div>
              <label className="block text-xs font-bold text-green-800 mb-1">Min Spend ($)</label>
              <input 
                type="number" 
                value={formData.rules.minSpend}
                onChange={e => setFormData({...formData, rules: {...formData.rules, minSpend: Number(e.target.value)}})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-green-800 mb-1">Discount Amount ($)</label>
              <input 
                type="number" 
                value={formData.rules.discountAmount}
                onChange={e => setFormData({...formData, rules: {...formData.rules, discountAmount: Number(e.target.value)}})}
                className="w-full border p-2 rounded"
              />
            </div>
            <p className="col-span-2 text-xs text-green-600">Example: Spend $300, Get $20 Off.</p>
          </div>
        );
      case 'free_shipping':
        return (
          <div className="bg-purple-50 p-4 rounded-lg">
              <label className="block text-xs font-bold text-purple-800 mb-1">Free Shipping Threshold ($)</label>
              <input 
                type="number" 
                value={formData.rules.freeShippingThreshold}
                onChange={e => setFormData({...formData, rules: {...formData.rules, freeShippingThreshold: Number(e.target.value)}})}
                className="w-full border p-2 rounded"
              />
               <p className="text-xs text-purple-600 mt-1">Orders above this amount (after discounts) will get free shipping.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Active Campaigns ({campaigns.length})</h2>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
        >
          + New Campaign
        </button>
      </div>

      <div className="grid gap-4 mb-10">
        {campaigns.map(camp => (
            <div key={camp._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{camp.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${camp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {camp.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-300">
                            {camp.type === 'buy_x_get_y' ? 'Buy X Get Y' : camp.type === 'tiered_discount' ? 'Tiered Discount' : 'Free Shipping'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{camp.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Scope: {camp.scope === 'all' ? 'Entire Store' : `Specific Products (${camp.targetProducts?.length || 0})`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(camp)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(camp._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
            </div>
        ))}
        {campaigns.length === 0 && <div className="text-center py-10 text-gray-400">No campaigns found.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-xl font-bold">{editingId ? 'Edit Campaign' : 'New Campaign'}</h3>
                        <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Campaign Name</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. Summer Sale" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Campaign Type</label>
                            <select 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value as any})} 
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="buy_x_get_y">Buy X Get Y (Free Gift)</option>
                                <option value="tiered_discount">Spend & Save (Discount)</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Public)</label>
                        <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. Buy 5 get 1 free!" />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Duration (Optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                                    className="w-full border p-2 rounded" 
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty for immediate start</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.endDate}
                                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                    className="w-full border p-2 rounded" 
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Rule Configuration</h4>
                        {renderRuleInputs()}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Scope & Products</h4>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formData.scope === 'all'} onChange={() => setFormData({...formData, scope: 'all'})} />
                                <span>Entire Store</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formData.scope === 'specific'} onChange={() => setFormData({...formData, scope: 'specific'})} />
                                <span>Specific Products Only</span>
                            </label>
                        </div>
                        
                        {/* 产品选择器 (带错误提示) */}
                        {formData.scope === 'specific' && (
                            <div className="bg-gray-50 p-4 rounded border">
                                {productLoadError ? (
                                    <div className="text-red-500 text-sm mb-2">
                                        ⚠️ Error loading products: {productLoadError}
                                        <br/>
                                        <span className="text-xs text-gray-500">Please check if /api/admin/product/list exists.</span>
                                    </div>
                                ) : (
                                    <>
                                        <input 
                                            type="text" 
                                            placeholder="Search products or categories..." 
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            className="w-full border p-2 rounded mb-3 text-sm"
                                        />
                                        <div className="h-40 overflow-y-auto space-y-1">
                                            {products.length > 0 ? filteredProducts.map(p => (
                                            <label key={p._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input 
                                                type="checkbox" 
                                                checked={formData.targetProducts.includes(p._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({...prev, targetProducts: [...prev.targetProducts, p._id]}));
                                                    } else {
                                                        setFormData(prev => ({...prev, targetProducts: prev.targetProducts.filter(id => id !== p._id)}));
                                                    }
                                                }}
                                                /> 
                                                <span className="text-sm">
                                                    {p.name} <span className="text-gray-400 text-xs ml-1">[{p.categoryName}]</span>
                                                </span>
                                            </label>
                                            )) : <p className="text-xs text-gray-400">Loading products...</p>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-right">Selected: {formData.targetProducts.length}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={resetForm} className="px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                            {loading ? 'Saving...' : 'Save Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}