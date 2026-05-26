import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 左侧侧边栏 */}
      <aside className="w-64 bg-white border-r border-gray-200 shrink-0 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">MY CIGS ADMIN</h1>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/admin/products" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            📦 Products
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            🏷️ Categories
          </Link>
          <Link href="/admin/banners" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            🖼️ Banners
          </Link>
          
          {/* ▼▼▼ 新增入口 ▼▼▼ */}
          <Link href="/admin/campaigns" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            🔥 Campaigns
          </Link>
          {/* ▲▲▲ 新增入口 ▲▲▲ */}

          <Link href="/admin/shipping" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            🚚 Shipping
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            📄 Orders
          </Link>
          <Link href="/admin/customers" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            👥 Customers
          </Link>
          <Link href="/admin/feedback" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            📝 Feedback Log
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
            ⚙️ Settings
          </Link>
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="/" className="block px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Back to Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* 右侧内容区域 */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}