import CategoryManager from '@/components/CategoryManager';
import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';

// 强制动态渲染，保证数据最新
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  await dbConnect();
  
  // 1. 获取所有分类
  // lean() 把 mongoose 对象转为普通 JS 对象，解决序列化警告
  const categories = await Category.find({}).sort({ order: 1 }).lean();

  // 必须把 _id 转换成 string，否则传递给客户端组件时会报错
  const formattedCategories = categories.map((cat: any) => ({
    ...cat,
    _id: cat._id.toString(),
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
        <p className="text-gray-500 mt-1">管理产品类别 (如: 卷烟, 电子烟)</p>
      </div>

      {/* 引入我们刚写的客户端组件 */}
      <CategoryManager initialCategories={formattedCategories} />
    </div>
  );
}