import dbConnect from '@/lib/dbConnect';
import Banner from '@/lib/models/Banner';
import BannerForm from '@/components/BannerForm';

// 注意：params 是 Promise，适配 Next.js 16
export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // 等待 params 解析
  const { id } = await params;
  
  const banner = await Banner.findById(id).lean();

  if (!banner) return <div>轮播图不存在</div>;

  const formattedBanner = {
    ...banner,
    _id: banner._id.toString()
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🖼️ 编辑轮播图</h1>
        <p className="text-gray-500 text-sm mt-1">ID: {id}</p>
      </div>
      <BannerForm initialData={formattedBanner} />
    </div>
  );
}