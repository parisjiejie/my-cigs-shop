"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminOrderActionsProps {
    orderId: string;
    orderNumber: string;
    status: string;
    paymentReminderStopped: boolean;
    onStatusChange?: () => void;
}

export default function AdminOrderActions({
    orderId,
    orderNumber,
    status,
    paymentReminderStopped,
    onStatusChange
}: AdminOrderActionsProps) {
    const router = useRouter();
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('AusPost');
    const [loading, setLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);

    const handleStopReminder = async () => {
        setStopLoading(true);
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, action: 'stopReminders' })
            });

            if (res.ok) {
                if (onStatusChange) onStatusChange();
                else router.refresh();
            }
        } catch (err) {
            console.error('Failed to stop reminders:', err);
        } finally {
            setStopLoading(false);
        }
    };

    const handleShip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber || !carrier) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    status: 'Shipped',
                    trackingNumber,
                    carrier
                })
            });

            if (res.ok) {
                setShowShippingForm(false);
                if (onStatusChange) onStatusChange();
                else router.refresh();
                window.location.reload();
            }
        } catch (err) {
            console.error('Failed to ship:', err);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'Pending') {
        return (
            <>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowShippingForm(true)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition shadow-sm"
                    >
                        Mark Shipped
                    </button>
                    {!paymentReminderStopped ? (
                        <button
                            onClick={handleStopReminder}
                            disabled={stopLoading}
                            className="text-[10px] text-gray-400 hover:text-red-500 underline disabled:opacity-50"
                        >
                            {stopLoading ? '...' : 'Stop Reminders'}
                        </button>
                    ) : (
                        <span className="text-[10px] text-gray-300">
                            Reminders Stopped
                        </span>
                    )}
                </div>

                {showShippingForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
                            <form onSubmit={handleShip} className="p-6 space-y-5">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-3">
                                    Ship Order #{orderNumber}
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Carrier
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
                                    <label className="block text-sm font-medium mb-1">
                                        Tracking Number
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

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowShippingForm(false)}
                                        className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                                    >
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
                )}
            </>
        );
    }

    if (status === 'Shipped') {
        return (
            <span className="text-sm text-blue-600 font-medium">
                Shipped <span className='text-gray-400 text-xs'>({carrier})</span>
            </span>
        );
    }

    return null;
}
