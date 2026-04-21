import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import CustomerListClient from '@/components/CustomerListClient';
import { unstable_noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  unstable_noStore();
  await dbConnect();

  // 1. 获取所有用户和所有订单
  const [users, orders] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).lean(),
    Order.find({}).lean(),
  ]);

  // 2. 计算每个用户的消费数据 (简单的内存聚合)
  const formattedCustomers = users.map((user: any) => {
    // 找到属于该用户的所有订单
    const userOrders = orders.filter((o: any) => 
        o.userId && o.userId.toString() === user._id.toString()
    );
    
    // 计算总消费 (只计算已完成或已发货的订单，或者所有订单视情况而定)
    // 这里我们计算所有非取消订单
    const validOrders = userOrders.filter((o: any) => o.status !== 'Cancelled');
    const totalSpent = validOrders.reduce((acc, curr: any) => acc + (curr.finalTotal || 0), 0);

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      referredBy: user.referredBy ? user.referredBy.toString() : null,
      createdAt: user.createdAt.toISOString(),
      orderCount: validOrders.length,
      totalSpent: totalSpent,
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">Manage your members and view their activity</p>
      </div>

      <CustomerListClient customers={formattedCustomers} />
    </div>
  );
}