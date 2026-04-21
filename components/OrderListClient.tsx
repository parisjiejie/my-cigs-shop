"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderStatus from '@/components/OrderStatus';
import ExportOrders from '@/components/ExportOrders';
import ShipmentModal from '@/components/ShipmentModal';

type SortKey = 'orderNumber' | 'createdAt' | 'finalTotal' | 'status';
type SortOrder = 'asc' | 'desc';

export default function OrderListClient({ orders = [] }: { orders?: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') || 'All';

    // --- State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // --- Logic ---

    const handleShipClick = (order: any) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // 🆕 新增：处理停止提醒
    const handleStopReminder = async (orderId: string) => {
        if (!confirm('Stop sending payment reminders for this order?')) return;
        
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, action: 'stopReminders' }), // 调用特定 action
            });

            if (res.ok) {
                alert('Payment reminders stopped.');
                router.refresh(); // 刷新页面数据
            } else {
                alert('Failed to stop reminders.');
            }
        } catch (e) {
            alert('Network error');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        router.push(`/admin/orders?status=${newStatus}`);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            const allIds = filteredAndSortedOrders.map(o => o._id);
            setSelectedIds(new Set(allIds));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleModalClose = () => {
        setShowModal(false);
        router.refresh(); 
    };

    // --- Data Processing ---
    const filteredAndSortedOrders = useMemo(() => {
        let data = orders.filter(order => {
            const term = searchTerm.toLowerCase();
            const orderNo = order.orderNumber?.toLowerCase() || '';
            const customerName = order.shippingInfo?.fullName?.toLowerCase() || '';
            const status = order.status?.toLowerCase() || '';
            return orderNo.includes(term) || customerName.includes(term) || status.includes(term);
        });

        data.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'createdAt') {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            } else if (sortKey === 'finalTotal') {
                valA = Number(a.finalTotal);
                valB = Number(b.finalTotal);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [orders, searchTerm, sortKey, sortOrder]);

    const selectedOrdersData = filteredAndSortedOrders.filter(order => selectedIds.has(order._id));

    const SortIcon = ({ colKey }: { colKey: SortKey }) => {
        if (sortKey !== colKey) return <span className="text-gray-300 ml-1 text-xs">⇅</span>;
        return <span className="text-blue-600 ml-1 text-xs">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
    };

    const ORDER_STATUSES = [
        { value: 'All', label: 'All Statuses' },
        { value: 'Pending', label: 'Pending Payment' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                        <p className="text-gray-500 mt-1">Manage shipments and download reports</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                        <select 
                            value={currentStatus}
                            onChange={handleFilterChange}
                            className="border border-gray-300 p-2 rounded-lg bg-white text-sm font-medium focus:ring-blue-500 h-10"
                        >
                            {ORDER_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search Order # or Name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 pl-4 pr-10 py-2 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none h-10"
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
                        </div>

                        <ExportOrders orders={selectedOrdersData} selectedCount={selectedIds.size} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200 select-none">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input 
                                            type="checkbox" 
                                            onChange={toggleSelectAll}
                                            checked={filteredAndSortedOrders.length > 0 && selectedIds.size === filteredAndSortedOrders.length}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('orderNumber')}>
                                        Order # <SortIcon colKey="orderNumber" />
                                    </th>
                                    <th className="px-6 py-4">Customer Info</th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('finalTotal')}>
                                        Total <SortIcon colKey="finalTotal" />
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                        Status <SortIcon colKey="status" />
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('createdAt')}>
                                        Date <SortIcon colKey="createdAt" />
                                    </th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAndSortedOrders.map((order: any) => (
                                    <tr key={order._id} className={`hover:bg-gray-50 transition ${selectedIds.has(order._id) ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(order._id)}
                                                onChange={() => toggleSelectOne(order._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-blue-600 font-medium text-sm">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.shippingInfo?.fullName || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{order.shippingInfo?.phone || 'N/A'}</div>
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
                                                    {/* 🆕 停止提醒按钮 */}
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
                                            ) : order.status === 'Shipped' ? (
                                                <div className="text-sm text-blue-600 font-medium">
                                                    Shipped <span className='text-gray-400 text-xs'>({order.carrier})</span>
                                                </div>
                                            ) : (
                                                <OrderStatus orderId={order._id} initialStatus={order.status} />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
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
                                
                                {filteredAndSortedOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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