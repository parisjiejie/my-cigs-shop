import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import DeleteButton from '@/components/DeleteButton';

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage inventory, pricing and availability</p>
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
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Inventory Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p: any) => {
                let categoryName = 'Uncategorized';
                const catId = p.category?.toString();
                
                if (categoryMap[catId]) {
                  categoryName = categoryMap[catId];
                } else if (typeof p.category === 'string' && !p.category.match(/^[0-9a-fA-F]{24}$/)) {
                  categoryName = `${p.category} (Legacy)`;
                }

                // 统一库存逻辑
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}