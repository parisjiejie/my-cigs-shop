"use client";

import { Suspense } from 'react';
import Storefront from './Storefront';

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

interface StorefrontWrapperProps {
  banners: Banner[];
  categories: Category[];
  products: Product[];
}

// 加载状态组件
function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Store...</p>
      </div>
    </div>
  );
}

export default function StorefrontWrapper({ banners, categories, products }: StorefrontWrapperProps) {
  return (
    <Suspense fallback={<StorefrontLoading />}>
      <Storefront banners={banners} categories={categories} products={products} />
    </Suspense>
  );
}
