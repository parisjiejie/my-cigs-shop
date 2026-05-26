import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import ProductForm from '@/components/ProductForm';

// 注意类型定义的变化：params 是一个 Promise
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  // ▼▼▼ 修复重点：先等待 params 解析，才能拿到 id ▼▼▼
  const resolvedParams = await params;
  const id = resolvedParams.id;
  // ▲▲▲ 修复结束 ▲▲▲
  
  // 查找产品数据
  const product = await Product.findById(id).lean();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        产品不存在或已被删除
      </div>
    );
  }

  // 必须把 _id 转换成 string
  const initialData = {
    ...product,
    _id: product._id.toString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-800">✏️ 编辑产品</h1>
        <p className="text-gray-500 text-sm">ID: {id}</p>
      </div>
      {/* 复用表单组件 */}
      <ProductForm initialData={initialData} />
    </div>
  );
}