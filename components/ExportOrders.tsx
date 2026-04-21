"use client";

import { useState } from 'react';

interface ExportOrdersProps {
  orders: any[];
  selectedCount: number; // 必须接收选中数量
}

export default function ExportOrders({ orders, selectedCount }: ExportOrdersProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (orders.length === 0) {
      alert("No orders selected to export.");
      return;
    }

    setLoading(true);
    try {
      // 1. 定义 CSV 表头
      const headers = [
        "Order ID",
        "Customer Name",
        "Email",
        "Phone",
        "Total Amount",
        "Status",
        "Date",
        "Shipping Address",
        "Carrier",
        "Tracking Number"
      ];

      // 2. 格式化数据行
      const rows = orders.map(order => [
        order.orderNumber,
        `"${order.shippingInfo?.fullName || 'Guest'}"`, 
        order.shippingInfo?.email || '',
        order.shippingInfo?.phone || '',
        order.finalTotal?.toFixed(2),
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
        `"${order.shippingInfo?.addressLine1 || ''} ${order.shippingInfo?.city || ''}"`,
        order.carrier || '',
        order.trackingNumber || ''
      ]);

      // 3. 拼接 CSV 内容
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 4. 创建下载链接并触发
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); 
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading || selectedCount === 0}
      className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
        selectedCount > 0 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      {loading ? 'Exporting...' : `📥 Export Selected (${selectedCount})`}
    </button>
  );
}