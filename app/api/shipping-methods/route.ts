import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingMethod from '@/lib/models/ShippingMethod';

// 获取所有启用的快递方式 (公开接口)
export async function GET() {
  try {
    await dbConnect();
    // 只返回 isActive: true 的，并按 order 排序
    const methods = await ShippingMethod.find({ isActive: true }).sort({ order: 1 }).lean();
    
    const formattedMethods = methods.map((m: any) => ({
      ...m,
      _id: m._id.toString(),
    }));

    return NextResponse.json(formattedMethods);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
  }
}