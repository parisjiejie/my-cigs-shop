import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/lib/models/Banner';
// 引入刚才拆分出去的组件，解决 'use client' 冲突
import DeleteBannerButton from '../../../components/DeleteBannerButton';

export const dynamic = 'force-dynamic';

export default async function BannersPage() {
  await dbConnect();
  
  // 获取数据：按位置分组，然后按序号排序
  // lean() 将 Mongoose 对象转换为普通 JavaScript 对象
  const banners = await Banner.find({}).sort({ position: 1, order: 1 }).lean();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">轮播图管理</h1>
          <p className="text-gray-500 mt-1">管理首页展示的 Banner 图片</p>
        </div>
        <Link href="/admin/banners/add" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-sm transition flex items-center gap-2">
          <span>+</span> 新增轮播图
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">预览</th>
                <th className="px-6 py-4">标题/位置</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">排序</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((b: any) => (
                <tr key={b._id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="w-32 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                      {/* 这里为了简化暂时使用 img 标签 */}
                      <img src={b.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{b.title || '无标题'}</div>
                    <div className="text-xs text-gray-500 mt-1 uppercase bg-gray-100 inline-block px-2 py-0.5 rounded">
                      {b.position === 'home_top' ? '首页顶部' : '首页中部'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {b.isActive ? (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">启用中</span>
                    ) : (
                      <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded text-xs">已停用</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    {b.order}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <Link href={`/admin/banners/${b._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        编辑
                      </Link>
                      {/* 使用刚才新建的客户端组件 */}
                      <DeleteBannerButton id={b._id.toString()} />
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    暂无轮播图，请点击右上角添加
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}