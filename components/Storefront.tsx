"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AddToCartButton from '@/components/AddToCartButton';

// 定义数据类型接口
interface Banner {
  _id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string; 
  price: number;
  image: string;
  category: string;
  stock: number;
  brand?: string;
  lowStockThreshold?: number;
}

interface StorefrontProps {
  banners: Banner[];
  categories: Category[];
  products: Product[];
}

export default function Storefront({ banners, categories, products }: StorefrontProps) {
  const searchParams = useSearchParams();
  // 增加默认值防止 categories 为空时报错
  const [activeCategory, setActiveCategory] = useState<string>(categories?.[0]?._id || '');
  const [currentBanner, setCurrentBanner] = useState(0);

  // 1. 从 URL 获取搜索词
  const searchTerm = searchParams.get('search') || '';

  // 轮播图自动切换逻辑
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [banners]);

  // 2. 核心筛选逻辑 (分类 + 模糊搜索)
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
        // 分类匹配
        const matchCategory = activeCategory ? product.category === activeCategory : true;
        
        // 搜索匹配 (名称或品牌，不区分大小写)
        const searchContent = (product.name + (product.brand || '')).toLowerCase();
        const matchSearch = searchContent.includes(searchTerm.toLowerCase().trim());
        
        // 如果有搜索词，则忽略分类限制 (全局搜索)；否则应用分类限制
        return searchTerm ? matchSearch : (matchCategory && matchSearch);
    });
  }, [activeCategory, searchTerm, products]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      {/* --- 1. 轮播图区域 (仅在非搜索状态下显示) --- */}
      {!searchTerm && banners && banners.length > 0 && (
        <div className="relative w-full h-[200px] md:h-[400px] bg-gray-200 overflow-hidden">
          {banners.map((banner, index) => (
            <div 
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} className="block w-full h-full">
                  <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                </Link>
              ) : (
                <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentBanner ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- 2. 核心内容区 --- */}
      <div className="container mx-auto px-4 py-8">
        
        {/* 搜索状态提示 */}
        {searchTerm && (
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                    Search Results for <span className="text-red-600">"{searchTerm}"</span>
                </h2>
                <Link href="/" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                    Clear Search
                </Link>
            </div>
        )}

        {/* 分类切换标签 (仅在非搜索状态下显示) */}
        {!searchTerm && categories && (
            <div className="flex flex-wrap justify-center gap-4 mb-10">
            {categories.map((cat) => (
                <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all transform active:scale-95 ${
                    activeCategory === cat._id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-500'
                }`}
                >
                {cat.name}
                </button>
            ))}
            </div>
        )}

        {/* 产品列表 Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                
                {/* 产品图片 - 点击跳转详情 */}
                <Link href={`/product/${product.slug || '#'}`} className=" relative h-40 md:h-56 w-full mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="object-contain h-full w-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500 p-2" 
                  />
                  {/* 库存标签 */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-wider transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </Link>
                
                {/* 产品信息 */}
                <div className="flex-1 flex flex-col">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">{product.brand}</p>
                  
                  {/* 标题 */}
                  <Link href={`/product/${product.slug || '#'}`} className="block">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base leading-snug line-clamp-2 h-10 mb-2 hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {/* 价格与按钮 */}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-red-600 font-extrabold text-lg md:text-xl">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.stock > 0 && product.stock < (product.lowStockThreshold || 5) && (
                        <span className="text-orange-500 text-xs font-bold animate-pulse">
                          Low Stock!
                        </span>
                      )}
                    </div>

                    {product.stock > 0 ? (
                      <AddToCartButton product={product} />
                    ) : (
                      <button disabled className="w-full py-2 bg-gray-200 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="text-4xl mb-4">🔍</div>
             <p className="text-gray-500 text-lg">No products found.</p>
             {searchTerm && (
                <p className="text-gray-400 text-sm mt-2">
                    Try checking your spelling or use different keywords.
                </p>
             )}
          </div>
        )}
      </div>
    </div>
  );
}