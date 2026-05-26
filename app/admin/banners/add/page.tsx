import BannerForm from '@/components/BannerForm';

export default function AddBannerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🖼️ 新增轮播图</h1>
        <p className="text-gray-500 text-sm mt-1">上传图片并设置显示位置</p>
      </div>
      <BannerForm />
    </div>
  );
}