"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShipmentModalProps {
    orderId: string;
    orderNumber: string;
    onClose: () => void;
}

export default function ShipmentModal({ orderId, orderNumber, onClose }: ShipmentModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('AusPost');

    const handleShip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber || !carrier) {
            alert('Please enter both Tracking Number and Carrier.');
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId, 
                    status: 'Shipped', // 更新状态为已发货
                    trackingNumber, 
                    carrier 
                }),
            });

            if (res.ok) {
                onClose();
                router.refresh(); // 刷新后台列表
            } else {
                alert('Failed to update order status.');
            }
        } catch (error) {
            alert('Network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
                <form onSubmit={handleShip} className="p-6 space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Ship Order #{orderNumber}</h3>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Tracking Number (Required)</label>
                        <input 
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            required
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-blue-500 outline-none" 
                            placeholder="e.g., 32014023245"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Carrier / Logistics Company</label>
                        <select 
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-blue-500 outline-none"
                        >
                            <option value="AusPost">AusPost (Australia Post)</option>
                            <option value="Toll">Toll</option>
                            <option value="FastWay">FastWay</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Shipping...' : 'Confirm Shipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}