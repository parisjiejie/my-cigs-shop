import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/lib/models/Campaign';
import { unstable_noStore } from 'next/cache'; // 引入 noStore 防止缓存陈旧数据

export const dynamic = 'force-dynamic';

export async function GET() {
  // 强制禁用缓存，确保获取最新活动状态
  unstable_noStore();
  
  try {
    await dbConnect();
    
    const now = new Date();
    
    // 查找所有激活的、且在有效期内的活动
    const campaigns = await Campaign.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ],
      $and: [
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
      ]
    }).lean();

    // 序列化数据
    const formatted = campaigns.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      targetProducts: c.targetProducts?.map((id: any) => id.toString()) || []
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch Active Campaigns Error:", error);
    // 返回空数组而不是 500 错误，防止前端页面因此崩溃
    return NextResponse.json([]);
  }
}