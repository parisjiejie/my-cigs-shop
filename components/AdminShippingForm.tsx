"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShippingFormProps {
    orderId: string;
    orderNumber: string;
    onSuccess?: () => void;
}

export default function AdminShippingForm({ orderId, orderNumber, onSuccess }: ShippingFormProps) {
    const router = useRouter();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('AusPost');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber || !carrier) {
            setError('Please enter both Tracking Number and Carrier.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: 'Shipped',
                    trackingNumber,
                    carrier
                }),
            });

            if (res.ok) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                    window.location.reload();
                }
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update order.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2">
                🚚 Add Shipping Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Carrier <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="AusPost">AusPost (Australia Post)</option>
                            <option value="Toll">Toll</option>
                            <option value="FastWay">FastWay</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            required
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., 32014023245"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold text-white transition ${
                        loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                    }`}
                >
                    {loading ? 'Updating...' : 'Mark as Shipped'}
                </button>
            </form>
        </div>
    );
}
