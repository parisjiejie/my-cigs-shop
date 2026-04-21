import dbConnect from '@/lib/dbConnect';
import Banner from '@/lib/models/Banner';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import Settings from '@/lib/models/Settings';
import Storefront from '@/components/Storefront';
import StorefrontBrand from '@/components/StorefrontBrand';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Puff And Present Emporium | Premium Tobacco',
  description: 'Welcome to Puff And Present Emporium - Your premium destination for tobacco products.',
};

export default async function Home() {
  await dbConnect();

  const [bannersData, categoriesData, productsData, settingsData] = await Promise.all([
    Banner.find({ isActive: true }).sort({ position: 1, order: 1 }).lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    Product.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).lean(),
    Settings.findOne({ key: 'global_settings' }).lean(),
  ]);

  const banners = bannersData.map((b: any) => ({ ...b, _id: b._id.toString() }));
  const categories = categoriesData.map((c: any) => ({ ...c, _id: c._id.toString() }));
  
  const products = productsData.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    category: p.category ? p.category.toString() : '',
    // 关键修复：使用英文文件名 default-product.jpg
    // 如果数据库里的 image 字段为空或不存在，强制使用默认图
    image: (p.image && p.image.trim() !== '') ? p.image : '/default-product.jpg',
  }));

  const currentTheme = (settingsData as any)?.theme || 'simple';

  return (
    <main>
      <AgeVerificationModal />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Store...</div>}>
        {currentTheme === 'brand' ? (
          <StorefrontBrand banners={banners} categories={categories} products={products} />
        ) : (
          <Storefront banners={banners} categories={categories} products={products} />
        )}
      </Suspense>
    </main>
  );
}