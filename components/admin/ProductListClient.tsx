'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CSVActions from './CSVActions';
import DeleteButton from '@/components/DeleteButton';

interface Product {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  image?: string;
  category?: string;
}

interface ProductListClientProps {
  initialProducts: Product[];
  categoryMap: Record<string, string>;
}

export default function ProductListClient({ initialProducts, categoryMap }: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p._id));
    }
    setSelectAll(!selectAll);
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/admin/product/list');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setSelectedIds([]);
        setSelectAll(false);
      }
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <CSVActions productIds={selectedIds} onImportComplete={refreshProducts} />
        </div>
        <Link href="/admin/products/add" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-all flex items-center gap-2">
          <span>+</span> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Inventory Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                let categoryName = 'Uncategorized';
                const catId = p.category?.toString();
                
                if (catId && categoryMap[catId]) {
                  categoryName = categoryMap[catId];
                } else if (catId && typeof p.category === 'string' && !p.category.match(/^[0-9a-fA-F]{24}$/)) {
                  categoryName = `${p.category} (Legacy)`;
                }

                const lowStockThreshold = p.lowStockThreshold || 5;
                let stockStatus;
                if (p.stock <= 0) {
                    stockStatus = <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">Sold Out</span>;
                } else if (p.stock < lowStockThreshold) {
                    stockStatus = <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded">Low Stock ({p.stock})</span>;
                } else {
                    stockStatus = <span className="text-green-600 font-medium text-sm">{p.stock} in stock</span>;
                }

                return (
                  <tr key={p._id} className="hover:bg-gray-50 transition group">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-md border border-gray-200 shrink-0 overflow-hidden relative">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No IMG</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.brand || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {stockStatus}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link href={`/admin/products/${p._id}`} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                          Edit
                        </Link>
                        <DeleteButton id={p._id.toString()} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
