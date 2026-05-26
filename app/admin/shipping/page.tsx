import dbConnect from '@/lib/dbConnect';
import ShippingMethod from '@/lib/models/ShippingMethod';
import ShippingManager from '@/components/ShippingManager';

export const dynamic = 'force-dynamic';

export default async function ShippingPage() {
  await dbConnect();
  // 获取所有快递方式并按 order 排序
  const methods = await ShippingMethod.find({}).sort({ order: 1 }).lean();
  
  const formattedMethods = methods.map((m: any) => ({
      ...m,
      _id: m._id.toString(),
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Settings</h1>
        <p className="text-gray-500 mt-1">Manage delivery options and pricing</p>
      </div>
      <ShippingManager initialData={formattedMethods} />
    </div>
  );
}