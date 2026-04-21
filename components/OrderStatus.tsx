"use client";

import { useState } from 'react';

export default function OrderStatus({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || 'Pending');
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/update-order', {
        method: 'POST',
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (e) {
      alert('更新失败');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        status === 'Shipped' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
      
      {status !== 'Shipped' && (
        <button 
          onClick={() => updateStatus('Shipped')}
          disabled={loading}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '...' : '发货'}
        </button>
      )}
    </div>
  );
}