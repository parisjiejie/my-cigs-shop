import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import ProductListClient from '@/components/admin/ProductListClient';

export const dynamic = 'force-dynamic';

export default async function ProductListPage() {
  await dbConnect();
  
  const [products, categories] = await Promise.all([
    Product.find({}).sort({ createdAt: -1 }).lean(),
    Category.find({}).lean()
  ]);

  const categoryMap: Record<string, string> = {};
  categories.forEach((c: any) => {
    categoryMap[c._id.toString()] = c.name;
  });

  const serializedProducts = products.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name,
    brand: p.brand,
    price: p.price,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    image: p.image || p.images?.[0],
    category: p.category?.toString()
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 mt-1">Manage inventory, pricing and availability</p>
      </div>

      <ProductListClient initialProducts={serializedProducts} categoryMap={categoryMap} />
    </div>
  );
}