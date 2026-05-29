"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  orderNumber: string;
  finalTotal: number;
}

export default function PaymentFormClient({ order }: { order: Order }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    payerName: '',
    paymentAmount: order.finalTotal.toFixed(2),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: '',
    confirmed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmed) {
      setError('Please confirm that you have made the payment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/customer/order/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          payerName: formData.payerName,
          paymentAmount: formData.paymentAmount,
          paymentDate: formData.paymentDate,
          paymentReference: formData.paymentReference
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment');
      }

      // 刷新页面显示更新后的状态
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl">
      <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
        💳 Submit Payment Details
      </h3>
      <p className="text-green-700 text-sm mb-4">
        Please fill in your payment details below after making the bank transfer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.payerName}
            onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="Enter the name on your bank account"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Transferred <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              required
              value={formData.paymentAmount}
              onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 pl-7 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Reference
          </label>
          <input
            type="text"
            value={formData.paymentReference}
            onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50"
            placeholder="Bank transfer reference number"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="confirmed"
            checked={formData.confirmed}
            onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="confirmed" className="text-sm text-gray-600">
            I confirm that I have made the bank transfer for the above amount
          </label>
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
          {loading ? 'Submitting...' : 'Submit Payment Info'}
        </button>

        <p className="text-xs text-red-600 text-center mt-3">
          Please double-check your payment details. If you made an error, please contact us at pap.shop.service@gmail.com
        </p>
      </form>
    </div>
  );
}
