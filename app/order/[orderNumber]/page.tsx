import Link from 'next/link';
// ⚠️ 移除 Image 导入，改用标准 img 标签以避免复杂配置
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'; 
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  // 1. 获取 Session (安全检查)
  const session = await getServerSession(authOptions);
  
  // 2. 获取 URL 参数
  const { orderNumber } = await params;

  await dbConnect();

  // 3. 查找订单
  const order = await Order.findOne({ orderNumber }).lean();

  if (!order) {
    return notFound();
  }

  // 4. 权限检查逻辑 (防止数据泄露)
  const currentUserId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const orderUserId = order.userId?.toString();

  // 如果订单属于某个用户，但当前浏览者不是该用户，也不是管理员，则禁止访问
  if (orderUserId && orderUserId !== currentUserId && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">
            You do not have permission to view this order details.<br/>
            This order belongs to another user.
          </p>
          <Link href="/" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 font-medium transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 序列化 ID (防止 Next.js 传递对象报错)
  const formattedOrder = {
    ...order,
    _id: order._id.toString(),
    userId: order.userId?.toString(),
    items: order.items.map((item: any) => ({
      ...item,
      productId: item.productId?.toString(),
      _id: item._id?.toString(),
    })),
    createdAt: new Date(order.createdAt).toLocaleString('en-AU'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        {/* 顶部导航 */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/profile" className="hover:text-gray-900 underline">My Account</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Order Details</span>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* 订单头部状态 */}
          <div className="bg-gray-50 px-6 md:px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{formattedOrder.orderNumber}</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                Placed on: {formattedOrder.createdAt}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                formattedOrder.status === 'Completed' ? 'bg-green-100 text-green-700' :
                formattedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                formattedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {formattedOrder.status}
              </span>
              
              {/* 9. 修改：在物流号下面添加物流网站链接 */}
              {formattedOrder.trackingNumber && (
                <div className="flex flex-col items-end gap-1">
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-100">
                        🚚 Tracking #: <span className="font-mono font-bold select-all">{formattedOrder.trackingNumber}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">
                        Track your parcel at <a href="https://auspost.com.au" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">auspost.com.au</a> using the tracking number above.
                    </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* 商品列表 */}
            <h2 className="text-lg font-bold text-gray-800 mb-4">Items Ordered</h2>
            <div className="space-y-4 mb-8">
              {formattedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No IMG</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500">Unit Price: ${item.price?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-bold">x {item.quantity}</p>
                    <p className="text-red-600 font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
              
              {/* 收货信息 */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h3>
                <div className="text-gray-600 text-sm space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-900 text-base mb-1">{formattedOrder.shippingInfo?.fullName}</p>
                  <p>{formattedOrder.shippingInfo?.phone}</p>
                  <p>{formattedOrder.shippingInfo?.addressLine1}</p>
                  <p>{formattedOrder.shippingInfo?.city}, {formattedOrder.shippingInfo?.state} {formattedOrder.shippingInfo?.postcode}</p>
                  <p className="text-xs text-gray-400 mt-2">{formattedOrder.shippingInfo?.email}</p>
                </div>
              </div>

              {/* 费用明细 */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${formattedOrder.itemsTotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${formattedOrder.shippingCost?.toFixed(2)}</span>
                  </div>
                  {formattedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Discount</span>
                      <span>-${formattedOrder.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="font-extrabold text-red-600 text-2xl">${formattedOrder.finalTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 如果未付款，显示转账信息 */}
            {formattedOrder.status === 'Pending' && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <h3 className="text-yellow-800 font-bold mb-2 flex items-center gap-2">
                  ⚠️ Payment Pending
                </h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Please transfer the total amount to the account below. Use your <strong>Order Number</strong> as reference.
                </p>
                <div className="bg-white/60 p-3 rounded-lg text-sm font-mono text-yellow-900">
                  <p>BSB: 033161</p>
                  <p>ACC: 643665</p>
                  <p>Name: zhen-hong yang</p>
                  <p>Bank: westpac</p>
                  <p>Ref: {formattedOrder.orderNumber}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}