'use client';

import { useState, useEffect, useMemo } from 'react';
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
  
  // 筛选状态
  const [searchName, setSearchName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSoldOut, setFilterSoldOut] = useState(false);

  // 批量删除状态
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // 前端筛选
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 名称搜索
      if (searchName && !p.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      // 分类筛选
      if (filterCategory && p.category !== filterCategory) {
        return false;
      }
      // Sold Out 筛选
      if (filterSoldOut && p.stock > 0) {
        return false;
      }
      return true;
    });
  }, [products, searchName, filterCategory, filterSoldOut]);

  // 当筛选列表变化时，清除不在当前列表中的选中项
  useEffect(() => {
    const visibleIds = new Set(filteredProducts.map(p => p._id));
    setSelectedIds(prev => prev.filter(id => visibleIds.has(id)));
    setSelectAll(false);
  }, [filteredProducts]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p._id));
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

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.length} 个产品吗？此操作不可撤销！`)) return;

    setBatchDeleting(true);
    try {
      const res = await fetch('/api/admin/product/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '删除失败');

      // 刷新列表
      await refreshProducts();
    } catch (err: any) {
      alert(err.message || '批量删除出错');
    } finally {
      setBatchDeleting(false);
    }
  };

  // 生成分类选项列表（去重）
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { id: string; name: string }[] = [];
    products.forEach((p) => {
      const catId = p.category?.toString() || '';
      if (catId && !seen.has(catId)) {
        seen.add(catId);
        const catName = categoryMap[catId] || catId;
        options.push({ id: catId, name: catName });
      }
    });
    options.sort((a, b) => a.name.localeCompare(b.name));
    return options;
  }, [products, categoryMap]);

  return (
    <>
      {/* 工具栏：搜索 + 筛选 + 操作按钮 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 名称搜索 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search product name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 分类筛选 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Sold Out 筛选 */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={filterSoldOut}
              onChange={(e) => setFilterSoldOut(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
            />
            Sold Out Only
          </label>

          {/* 选中计数 */}
          {selectedIds.length > 0 && (
            <span className="text-sm text-gray-500 font-medium">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <CSVActions productIds={selectedIds} onImportComplete={refreshProducts} />

          {/* 批量删除按钮 */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              {batchDeleting ? '⏳ Deleting...' : `🗑️ Delete (${selectedIds.length})`}
            </button>
          )}

          <div className="flex-1" />

          <Link href="/admin/products/add" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition-all flex items-center gap-2 text-sm">
            <span>+</span> Add Product
          </Link>
        </div>
      </div>

      {/* 产品表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectAll && filteredProducts.length > 0}
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
              {filteredProducts.map((p) => {
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {products.length === 0 ? 'No products found. Start by adding one!' : 'No products match your filters.'}
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
