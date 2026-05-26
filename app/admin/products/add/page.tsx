import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';
import ProductForm from '@/components/ProductForm';

export default async function AddProductPage() {
  await dbConnect();
  // 获取分类列表，供表单选择
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  
  // 序列化 ID
  const formattedCategories = categories.map((cat: any) => ({
    ...cat,
    _id: cat._id.toString()
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✨ 新增产品</h1>
        <p className="text-gray-500 text-sm mt-1">请填写产品详情并设置库存</p>
      </div>
      <ProductForm categories={formattedCategories} />
    </div>
  );
}