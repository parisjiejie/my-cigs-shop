"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  // 自定义悬浮提示 (Tooltip)
  // 修复：将类型改为 any，解决 Recharts 类型定义在 Vercel 构建时的报错问题
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-gray-700 mb-1">{label}</p>
          <p className="text-blue-600 font-bold">
            销售额: ${payload[0].value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-6">📅 近 7 天销售趋势</h3>
      <div className="h-[350px] w-full">
        {/* ResponsiveContainer 确保图表自适应宽度 */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar 
              dataKey="total" 
              fill="#2563eb" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
              activeBar={{ fill: '#1d4ed8' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}