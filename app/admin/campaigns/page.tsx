import dbConnect from '@/lib/dbConnect';
import Campaign from '@/lib/models/Campaign';
import CampaignManager from '@/components/CampaignManager';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  await dbConnect();
  
  // 获取所有活动
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
  
  // 序列化
  const formattedCampaigns = campaigns.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      // 转换日期
      startDate: c.startDate ? c.startDate.toISOString() : null,
      endDate: c.endDate ? c.endDate.toISOString() : null,
      // 转换关联产品 ID 数组
      targetProducts: c.targetProducts ? c.targetProducts.map((id: any) => id.toString()) : []
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
        <p className="text-gray-500 mt-1">Manage discounts, free gifts, and shipping rules</p>
      </div>
      
      <CampaignManager initialCampaigns={formattedCampaigns} />
    </div>
  );
}