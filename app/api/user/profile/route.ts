import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'; 
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions); 

    if (!session || !session.user?.email) {
      // 如果未登录，返回 401 状态码，让前端知道要重定向到 /login
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    await dbConnect();

    // 2. 查找用户详细信息 (排除密码)
    const user = await User.findOne({ email: session.user.email }).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 3. 查找该用户的历史订单
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    // 序列化数据
    const serializableUser = {
        ...user,
        _id: user._id.toString(),
    };
    
    // 确保订单也是可序列化的
    const serializableOrders = orders.map(order => ({
        ...order,
        _id: order._id.toString(),
        userId: order.userId ? order.userId.toString() : null,
    }));

    return NextResponse.json({
      user: serializableUser,
      orders: serializableOrders
    });

  } catch (error: any) {
    console.error('获取个人信息失败:', error);
    // 关键修复：确保在发生连接或内部错误时，返回标准的 JSON 错误格式
    return NextResponse.json({ error: '服务器内部错误或数据库连接失败' }, { status: 500 });
  }
}