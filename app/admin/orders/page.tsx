import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import OrderListClient from '@/components/OrderListClient'; 
import { unstable_noStore } from 'next/cache';

// 强制动态渲染 (Server Component 特性)
export const dynamic = 'force-dynamic';

// =======================================================
// Server Data Fetcher Function
// =======================================================
async function fetchOrderData(statusFilter: string, startDate?: string, endDate?: string) {
    let query: any = {};
    if (statusFilter && statusFilter !== 'All') {
        query.status = statusFilter;
    }

    // 日期范围筛选
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            // 结束日期设为当天 23:59:59，包含整天
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt.$lte = end;
        }
    }

    try {
        unstable_noStore();
        const dbConnect = (await import('@/lib/dbConnect')).default;
        const Order = (await import('@/lib/models/Order')).default;
        
        await dbConnect();
        
        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

        if (!Array.isArray(orders)) return [];

        const formattedOrders = orders.map((order: any) => {
            const shippingInfo = order.shippingInfo || {
                fullName: order.customerName || 'Unknown Guest',
                phone: order.customerPhone || 'N/A',
                email: order.customerEmail || '',
                addressLine1: order.customerAddress || 'N/A',
                city: '', state: '', postcode: '',
            };
            
            const finalTotal = order.finalTotal !== undefined ? order.finalTotal : (order.totalAmount || 0);
            const orderNumber = order.orderNumber || `OLD-${order._id.toString().slice(-6).toUpperCase()}`;

            return {
                ...order,
                _id: order._id.toString(), 
                userId: order.userId ? order.userId.toString() : null,
                orderNumber,
                finalTotal,
                shippingInfo,
                // 🆕 关键新增：传递支付提醒状态
                paymentReminderStopped: order.paymentReminderStopped || false,
                items: (order.items || []).map((item: any) => ({
                    ...item,
                    _id: item._id ? item._id.toString() : null,
                    productId: item.productId ? item.productId.toString() : null,
                })),
                createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
                trackingNumber: order.trackingNumber || null,
                carrier: order.carrier || null,
            };
        });
        
        return formattedOrders;

    } catch (error) {
        console.error("BUILD/RUNTIME ERROR: Failed to fetch orders.", error);
        return []; 
    }
}


// =======================================================
// Next.js Page Entry
// =======================================================
export default async function OrdersManagementPage({ searchParams }: { searchParams: Promise<{ status?: string; startDate?: string; endDate?: string }> }) {
    const { status, startDate, endDate } = await searchParams;
    const statusFilter = status || 'All';
    
    const orders = await fetchOrderData(statusFilter, startDate, endDate); 
    
    return <OrderListClient orders={orders} />; 
}