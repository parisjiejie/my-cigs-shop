"use client";

import Link from 'next/link';
// 修复：改回使用 @ 别名，这是 Next.js 的标准引用方式，通常比相对路径更稳定
import { useCartStore } from '@/lib/store';
import { useEffect, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react'; 
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// 独立搜索组件 (包裹在 Suspense 中以避免构建错误)
function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // 从 URL 初始化搜索词
  const initialTerm = searchParams.get('search') || '';

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    // 如果不在首页，搜索时自动跳回首页
    if (pathname !== '/') {
        replace(`/?${params.toString()}`);
    } else {
        replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    // 调整：移除 flex-1，设置固定宽度或最大宽度，使其靠近右侧
    <div className="hidden md:block w-full max-w-md mr-2">
        <div className="relative group">
            <input
                type="text"
                placeholder="Search products..."
                defaultValue={initialTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-100 text-gray-800 text-sm border border-transparent rounded-full py-2.5 pl-10 pr-4 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
        </div>
    </div>
  );
}

// 手机端单独的搜索组件，逻辑相同
function SearchBarMobile() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) params.set('search', term);
        else params.delete('search');
        if (pathname !== '/') replace(`/?${params.toString()}`);
        else replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search products..."
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-red-500 outline-none"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
        </div>
    );
}

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession(); 

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const renderAuthLinks = () => {
    if (status === 'loading' || !mounted) {
      return <div className="w-10 h-8 bg-gray-100 animate-pulse rounded"></div>;
    }

    if (session?.user) {
      const role = (session.user as any).role;
      return (
        <div className="flex items-center gap-3">
          <Link href={role === 'admin' ? '/admin' : '/profile'} className="text-sm font-bold text-gray-700 hover:text-red-600 transition flex items-center gap-1">
             <span className="hidden lg:inline">{session.user.name}</span>
             <span className="lg:hidden">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             </span>
          </Link>
          {/* 修复：找回 Logout 按钮 */}
          <button 
            onClick={() => signOut()} 
            className="text-xs font-medium text-gray-500 hover:text-red-600 transition"
          >
            Log out
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-red-600 transition whitespace-nowrap">
          Login
        </Link>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 w-full overflow-hidden">
      {/* 调整：PC端增加了高度(h-20)和左右Padding(md:px-8)，恢复大气感 */}
      <div className="container mx-auto px-3 md:px-8 h-16 md:h-20 flex justify-between items-center gap-2 md:gap-4">
        
        {/* 1. Logo (Left) */}
        <Link href="/" className="shrink-0 hover:opacity-90 transition group">
           {/* Mobile View: Two Lines (保持不变) */}
           <div className="flex flex-col md:hidden leading-none">
              <span className="text-sm font-extrabold text-red-600 tracking-tighter">Puff And</span>
              <span className="text-sm font-extrabold text-red-600 tracking-tighter">Present Emporium</span>
           </div>
           {/* Desktop View: Single Line (调整：恢复较大字号 text-3xl) */}
           <span className="hidden md:block text-3xl font-extrabold text-red-600 tracking-tighter">
              Puff And Present Emporium
           </span>
        </Link>
        
        {/* 占位符：将 Search Bar 推向右侧 */}
        <div className="hidden md:block flex-1" />

        {/* 2. Search Bar (Middle - Desktop Only) */}
        <Suspense fallback={<div className="flex-1 hidden md:block" />}>
            <SearchBar />
        </Suspense>
        
        {/* 3. Actions (Right) */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {renderAuthLinks()}

          <Link href="/checkout" className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm group">
            <span className="font-bold text-xs md:text-sm">Cart</span>
            {totalItems > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold h-4 w-4 md:h-5 md:w-5 flex items-center justify-center rounded-full group-hover:bg-red-400 transition">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 4. Mobile Search (仅在手机端显示 - 保持不变) */}
      <div className="md:hidden px-3 pb-3 pt-1 border-t border-gray-100">
         <Suspense fallback={null}>
            <SearchBarMobile />
         </Suspense>
      </div>
    </nav>
  );
}