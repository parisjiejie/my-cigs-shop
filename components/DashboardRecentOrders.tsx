"use client"; 

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OrderStatus from '@/components/OrderStatus';
import ShipmentModal from '@/components/ShipmentModal';

export default function DashboardRecentOrders({ orders }: { orders: any[] }) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const handleShipClick = (order: any) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // 🆕 新增：处理停止提醒逻辑
    const handleStopReminder = async (orderId: string) => {
        if (!confirm('Stop sending payment reminders for this order?')) return;
        
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, action: 'stopReminders' }), 
            });

            if (res.ok) {
                alert('Payment reminders stopped.');
                router.refresh(); 
            } else {
                alert('Failed to stop reminders.');
            }
        } catch (e) {
            alert('Network error');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        router.refresh(); 
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">📄 Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                        View All Orders &rarr;
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status / Action</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order: any) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {order.shippingInfo?.fullName || order.customerName || 'Guest'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.shippingInfo?.phone || order.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-red-600 font-bold">
                                        ${(order.finalTotal || order.totalAmount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'Pending' ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <button
                                                    onClick={() => handleShipClick(order)}
                                                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition shadow-sm w-full"
                                                >
                                                    Mark Shipped
                                                </button>
                                                
                                                {/* 🆕 停止提醒按钮 */}
                                                {!order.paymentReminderStopped ? (
                                                    <button 
                                                        onClick={() => handleStopReminder(order._id)}
                                                        className="text-[10px] text-gray-400 hover:text-red-500 underline self-center"
                                                    >
                                                        Stop Reminders
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 self-center italic">
                                                        Reminders Stopped
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <OrderStatus orderId={order._id} initialStatus={order.status} />
                                                {order.status === 'Shipped' && (
                                                    <span className="text-xs text-gray-400">({order.carrier})</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.createdAt}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                        No recent orders.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedOrder && (
                <ShipmentModal 
                    orderId={selectedOrder._id}
                    orderNumber={selectedOrder.orderNumber}
                    onClose={handleModalClose}
                />
            )}
        </>
    );
}