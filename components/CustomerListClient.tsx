"use client";

import { useState } from 'react';

export default function CustomerListClient({ customers }: { customers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 简单的搜索过滤
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.referralCode && c.referralCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部搜索栏 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">All Customers ({filteredCustomers.length})</h2>
        <input 
            type="text" 
            placeholder="Search by name, email..." 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Referral Info</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50 transition group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                  {customer.role === 'admin' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Member
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                    {customer.referralCode ? (
                        <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {customer.referralCode}
                        </span>
                    ) : '-'}
                    {customer.referredBy && (
                        <div className="text-xs text-green-600 mt-1">
                            Referred by someone
                        </div>
                    )}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {customer.orderCount} Orders
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}