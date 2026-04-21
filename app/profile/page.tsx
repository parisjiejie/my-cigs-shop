import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import ProfileClient from '@/components/ProfileClient'; // 引入客户端组件
import { unstable_noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { Suspense } from 'react'; // 引入 Suspense 用于包裹

// 强制动态渲染，避免构建时的预渲染错误
export const dynamic = 'force-dynamic';

// 数据获取逻辑
async function fetchProfileData() {
    unstable_noStore();
    const session = await getServerSession(authOptions); 
    
    if (!session || !session.user?.email) {
        return null;
    }

    try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email }).select('-password').lean();
        
        if (!user) return null;

        const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

        // 序列化数据
        const serializableUser = {
            ...user,
            _id: user._id.toString(),
            userId: user._id.toString(),
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
        };
        
        // 序列化订单数据
        const serializableOrders = orders.map((order: any) => ({
            ...order,
            _id: order._id.toString(),
            userId: order.userId ? order.userId.toString() : null,
            finalTotal: order.finalTotal || 0,
            createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
            items: (order.items || []).map((item: any) => ({
                ...item,
                _id: item._id ? item._id.toString() : null,
                productId: item.productId ? item.productId.toString() : null,
            })),
        }));

        return { user: serializableUser, orders: serializableOrders };

    } catch (error) {
        console.error('SERVER ERROR fetching profile data:', error);
        return { user: null, orders: [] };
    }
}

// 页面主入口 (Server Component)
export default async function ProfilePageWrapper({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    // 获取数据
    const data = await fetchProfileData();
    
    // 如果未登录，重定向
    if (!data || !data.user) {
        redirect('/login');
    }

    // 解析 URL 参数
    const { tab } = await searchParams;
    
    // 关键修复：用 Suspense 包裹 Client Component
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-gray-500">Loading Profile...</div>
            </div>
        }>
            <ProfileClient initialData={data} urlTab={tab || null} />
        </Suspense>
    );
}