import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import DeleteButton from '@/components/DeleteButton';
import SalesChart from '@/components/SalesChart';
import DashboardRecentOrders from '@/components/DashboardRecentOrders'; 
import { unstable_noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 定义默认空数据，防止构建崩溃
  let orders: any[] = [];
  let products: any[] = [];

  try {
    unstable_noStore();
    await dbConnect();
    
    // 并行获取数据
    const data = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).lean(),
      Product.find({}).sort({ createdAt: -1 }).lean()
    ]);
    
    // 赋值前进行安全检查
    if (data[0]) orders = data[0];
    if (data[1]) products = data[1];

  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    // 出错时保持 orders 和 products 为 []，页面不会崩
  }

  // --- 数据处理：准备图表数据 (最近 7 天) ---
  const chartDataMap = new Map<string, number>();
  
  // 1. 初始化最近 7 天的日期 key
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    chartDataMap.set(dateStr, 0);
  }

  // 2. 遍历订单累加金额 (安全遍历)
  if (Array.isArray(orders)) {
    orders.forEach((order: any) => {
        if (!order.createdAt) return;
        const d = new Date(order.createdAt);
        const dateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        
        if (chartDataMap.has(dateStr)) {
        const currentTotal = chartDataMap.get(dateStr) || 0;
        const amount = order.finalTotal !== undefined ? order.finalTotal : (order.totalAmount || 0);
        chartDataMap.set(dateStr, currentTotal + amount);
        }
    });
  }

  const chartData = Array.from(chartDataMap, ([name, total]) => ({ name, total }));

  // --- 数据清洗：序列化订单数据 (用于 DashboardRecentOrders) ---
  const formattedRecentOrders = Array.isArray(orders) ? orders.slice(0, 5).map((order: any) => ({
    _id: order._id.toString(),
    orderNumber: order.orderNumber || `OLD-${order._id.toString().slice(-6).toUpperCase()}`,
    status: order.status,
    finalTotal: order.finalTotal !== undefined ? order.finalTotal : (order.totalAmount || 0),
    totalAmount: order.totalAmount, 
    customerName: order.customerName,
    phone: order.phone,
    carrier: order.carrier,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
    shippingInfo: order.shippingInfo || {
        fullName: order.customerName || 'Guest',
        phone: order.customerPhone || order.phone || 'N/A',
        email: order.customerEmail || '',
    }
  })) : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* 顶部标题栏 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/products/add" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 hover:bg-blue-700">
            <span>+</span> Add Product
          </Link>
          <Link href="/" className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all">
            View Store
          </Link>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Orders</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Products</p>
          <p className="text-4xl font-extrabold text-blue-600 mt-2">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Revenue (Est.)</p>
          <p className="text-4xl font-extrabold text-green-600 mt-2">
            ${orders.reduce((acc, order: any) => acc + (order.finalTotal || order.totalAmount || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* --- 销售图表 --- */}
      <div className="mb-10">
        <SalesChart data={chartData} />
      </div>

      {/* --- 库存列表 (Inventory) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">📦 Inventory Status</h2>
          <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">View All Products &rarr;</Link>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(products) && products.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {p.image ? (
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-gray-200" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">IMG</div>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{p.brand || '-'}</td>
                  
                  {/* 库存列：只显示数字，根据数量变色 */}
                  <td className={`px-6 py-4 font-bold ${p.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {p.stock}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 items-center">
                      <Link href={`/admin/products/${p._id}`} className="text-blue-600 text-sm hover:underline">Edit</Link>
                      <DeleteButton id={p._id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                     No products found.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 最新订单 (使用新的客户端组件) --- */}
      <DashboardRecentOrders orders={formattedRecentOrders} />
    </div>
  );
}