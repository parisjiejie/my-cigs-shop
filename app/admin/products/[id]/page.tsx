import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import ProductForm from '@/components/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  // 并行查询产品和分类
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean()
  ]);

  if (!product) {
    return <div>产品不存在</div>;
  }

  // 序列化
  const formattedProduct = {
    ...product,
    _id: product._id.toString(),
    category: (product.category as any)?.toString() || product.category // 处理分类ID引用
  };

  const formattedCategories = categories.map((cat: any) => ({
    ...cat,
    _id: cat._id.toString()
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✏️ 编辑产品</h1>
        <p className="text-gray-500 text-sm mt-1">ID: {id}</p>
      </div>
      <ProductForm initialData={formattedProduct} categories={formattedCategories} />
    </div>
  );
}