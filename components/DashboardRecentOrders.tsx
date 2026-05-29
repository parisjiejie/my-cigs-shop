"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShipmentModal from '@/components/ShipmentModal';

export default function DashboardRecentOrders({ orders }: { orders: any[] }) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const handleShipClick = (order: any) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

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
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order: any) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono text-blue-600 font-medium text-sm">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {order.shippingInfo?.fullName || order.customerName || 'Guest'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.shippingInfo?.phone || order.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-bold">
                                        ${typeof order.finalTotal === 'number' ? order.finalTotal.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'Pending' ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <button
                                                    onClick={() => handleShipClick(order)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition shadow-sm w-full"
                                                >
                                                    Mark Shipped
                                                </button>
                                                {!order.paymentReminderStopped ? (
                                                    <button
                                                        onClick={() => handleStopReminder(order._id)}
                                                        className="text-[10px] text-gray-400 hover:text-red-500 underline self-center"
                                                    >
                                                        Stop Reminders
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 self-center">
                                                        Reminders Stopped
                                                    </span>
                                                )}
                                            </div>
                                        ) : order.status === 'Paid' ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <button
                                                    onClick={() => handleShipClick(order)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition shadow-sm w-full"
                                                >
                                                    Mark Shipped
                                                </button>
                                            </div>
                                        ) : order.status === 'Shipped' ? (
                                            <div className="text-sm text-blue-600 font-medium">
                                                Shipped {order.carrier ? <span className="text-gray-400 text-xs">({order.carrier})</span> : null}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600 font-medium capitalize">
                                                {order.status}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.createdAt}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/order/${order.orderNumber}`}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
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
