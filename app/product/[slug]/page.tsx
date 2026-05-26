import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Navbar from '@/components/Navbar';
import AddToCartButton from '@/components/AddToCartButton';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// 动态生成 SEO 元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).select('name description image').lean();
  if (!product) return { title: 'Product Not Found' };
 
  // SEO 图片也需要处理默认值
  const displayImage = (product.image && product.image.trim() !== '') ? product.image : '/default-product.jpg';

  return {
    title: `${product.name} | Puff And Present Emporium`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online.`,
    openGraph: {
      title: product.name,
      images: [displayImage],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;

  const product = await Product.findOne({ slug: slug, isActive: true }).lean();

  if (!product) {
    notFound();
  }

  // 关键修复：处理默认图片逻辑
  // 如果数据库里的 image 字段为空或不存在，强制使用默认图
  const displayImage = (product.image && product.image.trim() !== '') 
    ? product.image 
    : '/default-product.jpg';

  const serializableProduct = {
    ...product,
    _id: product._id.toString(),
    category: product.category.toString(),
    image: displayImage, // 传递处理后的图片
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            
            {/* 左侧：图片 */}
            <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px] border-b md:border-b-0 md:border-r border-gray-100">
              <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
                {/* 使用标准 img 标签，避免 Next.js Image 配置问题 */}
                <img 
                  src={displayImage} 
                  alt={product.name}
                  className="object-contain mix-blend-multiply max-h-full max-w-full"
                  loading="eager"
                />
              </div>
            </div>

            {/* 右侧：信息 */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-auto">
                <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">
                  {product.brand || 'Premium Brand'}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl font-extrabold text-red-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  {product.stock <= 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-600">
                      🔴 Sold Out
                    </span>
                  ) : product.stock < (product.lowStockThreshold || 5) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-600 animate-pulse">
                      ⚠️ Low Stock! ({product.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-600">
                      ✅ In Stock
                    </span>
                  )}
                </div>

                {product.specifications && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Specifications</h3>
                    <p className="text-gray-800 font-medium whitespace-pre-line">{product.specifications}</p>
                  </div>
                )}

                <div className="prose prose-sm text-gray-600 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Product Description</h3>
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.description || 'No detailed description available.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                {product.stock > 0 ? (
                  <div className="w-full">
                    <AddToCartButton product={serializableProduct} />
                    <p className="text-center text-xs text-gray-400 mt-3">
                      🔒 Secure Payment · Fast Shipping · Guaranteed Authentic
                    </p>
                  </div>
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                    Temporarily Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}