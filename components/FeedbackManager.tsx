"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackManager({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    pageType: 'Client',
    pageName: '',
    issue: '',
    expectation: '',
    priority: 'Medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ ...formData, pageName: '', issue: '', expectation: '' });
    setLoading(false);
    router.refresh();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/feedback/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  // 🚀 核心功能：调用您之前选中的代码来生成日志
  const handleRelease = async () => {
    if (!confirm('确定要发布新版本吗？这将自动归档所有“已完成”的问题生成日志。')) return;
    setReleaseLoading(true);
    try {
      const res = await fetch('/api/admin/changelog/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.refresh();
      } else {
        alert(data.message || '发布失败，可能没有待发布的已完成项。');
      }
    } catch (e) {
      alert('Network error');
    }
    setReleaseLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧：提交新问题 */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 记录改善意见</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <select 
                    value={formData.pageType} 
                    onChange={e => setFormData({...formData, pageType: e.target.value})}
                    className="border p-2 rounded"
                >
                    <option value="Client">用户端</option>
                    <option value="Admin">管理端</option>
                </select>
                <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="border p-2 rounded"
                >
                    <option value="High">🔴 高优</option>
                    <option value="Medium">🟡 普通</option>
                    <option value="Low">🟢 低优</option>
                </select>
            </div>
            <input 
                placeholder="页面名称 (如 Checkout)" 
                value={formData.pageName}
                onChange={e => setFormData({...formData, pageName: e.target.value})}
                className="w-full border p-2 rounded"
                required
            />
            <textarea 
                placeholder="现有问题 (Issue)" 
                value={formData.issue}
                onChange={e => setFormData({...formData, issue: e.target.value})}
                className="w-full border p-2 rounded h-20"
                required
            />
            <textarea 
                placeholder="期望效果 (Expectation)" 
                value={formData.expectation}
                onChange={e => setFormData({...formData, expectation: e.target.value})}
                className="w-full border p-2 rounded h-20"
                required
            />
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Submitting...' : '提交记录'}
            </button>
          </form>
        </div>
      </div>

      {/* 右侧：列表与发布 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 发布控制台 */}
        <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 rounded-xl shadow-md text-white flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg">版本发布控制台</h3>
                <p className="text-gray-400 text-sm">将所有 <span className="text-green-400">Completed</span> 的项目打包为新版本日志</p>
            </div>
            <button 
                onClick={handleRelease}
                disabled={releaseLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition disabled:opacity-50"
            >
                {releaseLoading ? '发布中...' : '🚀 一键发布新版本'}
            </button>
        </div>

        {/* 列表 */}
        <div className="space-y-4">
            {items.map(item => (
                <div key={item._id} className={`bg-white p-4 rounded-xl shadow-sm border border-l-4 ${
                    item.status === 'Completed' ? 'border-l-green-500 opacity-70' : 
                    item.priority === 'High' ? 'border-l-red-500' : 'border-l-blue-500'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                [{item.pageType}] {item.pageName}
                            </span>
                            <h4 className="font-bold text-gray-800 mt-1">{item.issue}</h4>
                            <p className="text-sm text-gray-600 mt-1">💡 期望: {item.expectation}</p>
                            
                            {/* 如果已发布，显示版本号 */}
                            {item.fixedInVersion && (
                                <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    Fixed in {item.fixedInVersion}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <select 
                                value={item.status}
                                onChange={(e) => updateStatus(item._id, e.target.value)}
                                disabled={!!item.fixedInVersion} // 如果已发布，锁定状态
                                className={`text-xs font-bold px-2 py-1 rounded border ${
                                    item.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                    item.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                            >
                                <option value="Pending">🕒 Pending</option>
                                <option value="In Progress">🚧 In Progress</option>
                                <option value="Completed">✅ Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}