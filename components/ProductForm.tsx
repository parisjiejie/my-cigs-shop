"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  categories?: Category[];
}

export default function ProductForm({ initialData, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const defaultCategoryId = categories && categories.length > 0 ? categories[0]._id : '';

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category: initialData?.category || defaultCategoryId, 
    price: initialData?.price || '',
    originalPrice: initialData?.originalPrice || '',
    brand: initialData?.brand || '',
    stock: initialData?.stock || 0,
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    description: initialData?.description || '',
    specifications: initialData?.specifications || '',
    image: initialData?.image || '', 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 判断是新增还是编辑
      const url = initialData 
        ? `/api/admin/product/${initialData._id}` 
        : '/api/admin/product';
      
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="e.g. Marlboro Gold" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Slug (Optional)</label>
            <input name="slug" value={formData.slug} onChange={handleChange} className="input-field" placeholder="Auto-generated if empty" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="input-field">
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} className="input-field" placeholder="e.g. Marlboro" />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Original Price ($)</label>
              <input name="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={handleChange} className="input-field" placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input name="stock" type="number" value={formData.stock} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
              <input name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Specifications</label>
            <input name="specifications" value={formData.specifications} onChange={handleChange} className="input-field" placeholder="e.g. 20 sticks/pack" />
          </div>
        </div>

        {/* Image & Description */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Image & Description</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
            {/* 关键修改：移除 required，添加提示 */}
            <input 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              className="input-field" 
              placeholder="Leave empty to use default image" 
            />
            {formData.image ? (
              <div className="mt-2 h-32 w-32 relative border rounded bg-gray-50">
                <img src={formData.image} alt="Preview" className="h-full w-full object-contain" />
              </div>
            ) : (
               <p className="text-xs text-gray-500 mt-1">Default placeholder image will be used if left empty.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="input-field" placeholder="Product details..." />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 border-t pt-4">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .btn-primary {
          background-color: #2563eb;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-primary:disabled { opacity: 0.5; }
        .btn-secondary {
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .btn-secondary:hover { background-color: #f9fafb; }
      `}</style>
    </form>
  );
}