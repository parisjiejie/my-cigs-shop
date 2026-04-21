"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// 注意：这里我们不复用通用的 Navbar，因为品牌页需要完全定制的透明磨砂导航
// 我们直接在这个文件里重写适合此风格的 Header

// 定义数据接口
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

export default function StorefrontBrand({ banners, categories, products }: StorefrontProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?._id || '');
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动以改变导航栏透明度
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category === activeCategory)
    : products;

  const heroBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-white selection:text-black">
      
      {/* --- 0. 顶部通栏警示 (极度克制) --- */}
      <div className="bg-[#111] text-[#666] text-[9px] md:text-[10px] uppercase tracking-[0.25em] py-3 text-center border-b border-white/5 font-medium">
        Sales restricted to adults 18+. Smoking implies health risks.
      </div>

      {/* --- 1. 品牌定制导航 (Apple Style: 磨砂、置顶) --- */}
      <nav className={`fixed top-[37px] left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo: 使用衬线体强调高级感 */}
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest text-white hover:opacity-80 transition-opacity">
            MY CIGS
          </Link>

          {/* Desktop Links: 纯文字，大间距 */}
          <div className="hidden md:flex items-center gap-12">
            {categories.slice(0, 4).map(cat => (
              <button 
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeCategory === cat._id ? 'text-white border-b border-white pb-1' : 'text-gray-500 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] font-medium">
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Account</Link>
            <Link href="/checkout" className="text-white hover:text-gray-300 transition-colors">Bag</Link>
          </div>
        </div>
      </nav>

      {/* --- 2. Hero Section (杂志排版风) --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* 左侧文案: 大留白，衬线体 */}
          <div className="lg:col-span-5 flex flex-col justify-center z-10 order-2 lg:order-1">
            <span className="text-[#888] text-[10px] uppercase tracking-[0.3em] mb-6 block pl-1">
              Premium Selection
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-[1.1] mb-8 tracking-wide">
              The Essence <br/>
              <span className="text-gray-600 italic">of</span> Tobacco.
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-loose max-w-sm mb-12 font-light">
              We curate the world's finest brands for the discerning adult smoker. Authentic, refined, and delivered with discretion.
            </p>
            <div>
              <button 
                onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                className="group flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-white hover:text-gray-300 transition-all"
              >
                Discover Collection
                <span className="block h-px w-12 bg-white group-hover:w-20 transition-all duration-500"></span>
              </button>
            </div>
          </div>

          {/* 右侧主图: 极简，无边框 */}
          <div className="lg:col-span-7 relative h-[50vh] md:h-[70vh] w-full order-1 lg:order-2">
            {/* 氛围光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 blur-[120px] rounded-full" />
            
            {heroBanner ? (
              <div className="relative w-full h-full">
                <img 
                  src={heroBanner.imageUrl} 
                  alt={heroBanner.title || 'Hero'}
                  className="w-full h-full object-contain drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity duration-1000"
                />
              </div>
            ) : (
               <div className="w-full h-full border border-white/5 flex items-center justify-center text-gray-700 font-serif italic">
                 Visual Placeholder
               </div>
            )}
          </div>
        </div>
      </section>

      {/* --- 3. 产品展示 (Gallery Style) --- */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12">
          
          {/* 过滤器：像画廊的标签 */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-20">
            <button 
              onClick={() => setActiveCategory('')}
              className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${!activeCategory ? 'text-white' : 'text-gray-600 hover:text-gray-300'}`}
            >
              View All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeCategory === cat._id ? 'text-white' : 'text-gray-600 hover:text-gray-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 产品网格 */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group cursor-pointer">
                  
                  {/* 图片容器：固定比例，深灰色背景 */}
                  <Link href={`/product/${product.slug || '#'}`} className="block relative w-full aspect-3/4 bg-[#141414] overflow-hidden mb-6">
                    <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-700 group-hover:scale-105">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain mix-blend-screen opacity-80 group-hover:opacity-100 transition-all duration-500 filter grayscale-20% group-hover:grayscale-0"
                      />
                    </div>

                    {/* 缺货状态：极简线条 */}
                    {product.stock <= 0 && (
                      <div className="absolute top-4 right-4 border border-white/20 px-3 py-1 text-[9px] text-white uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}
                    
                    {/* Hover 操作栏 */}
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-linear-to-t from-black/80 to-transparent">
                        <p className="text-white text-[10px] uppercase tracking-widest text-center border-b border-white/20 pb-2">
                           View Product Details
                        </p>
                    </div>
                  </Link>

                  {/* 信息：极简文本 */}
                  <div className="text-center space-y-2">
                    <p className="text-[#555] text-[9px] uppercase tracking-[0.2em] font-medium">
                      {product.brand || 'Brand'}
                    </p>
                    <Link href={`/product/${product.slug || '#'}`}>
                      <h3 className="text-white font-serif text-lg tracking-wide group-hover:text-gray-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-xs font-light tracking-wide mt-1">
                       AUD {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[400px] flex items-center justify-center border-t border-b border-white/5">
              <p className="text-gray-600 font-serif italic text-xl">Collection Empty.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- Footer (纯文字) --- */}
      <footer className="border-t border-white/10 pt-20 pb-10 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-[#444]">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-serif text-lg mb-6">MY CIGS.</h4>
            <p className="text-xs leading-loose max-w-sm">
              We provide a curated selection of premium tobacco products for the adult connoisseur. 
              Responsibly sourced and delivered with discretion.
            </p>
          </div>
          <div>
            <h5 className="text-white text-[10px] uppercase tracking-[0.2em] mb-6">Service</h5>
            <ul className="space-y-4 text-xs tracking-wide">
              <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Returns</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white text-[10px] uppercase tracking-[0.2em] mb-6">Legal</h5>
            <ul className="space-y-4 text-xs tracking-wide">
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">18+ Age Verification</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[9px] uppercase tracking-widest text-[#333]">© 2025 My Cigs Australia.</p>
           <p className="text-[9px] uppercase tracking-widest text-[#333]">Melbourne, VIC</p>
        </div>
      </footer>
    </div>
  );
}