import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/lib/models/Coupon';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as any).id;
  
  // 关键修改：查找用户所有优惠券，让前端去过滤状态
  const coupons = await Coupon.find({ userId }).sort({ expiresAt: 1 }).lean(); // 按过期时间升序排列

  // 序列化
  const formattedCoupons = coupons.map((coupon: any) => ({
    ...coupon,
    _id: coupon._id.toString(),
    // 确保日期是 ISO 字符串格式，方便前端比较
    expiresAt: coupon.expiresAt.toISOString(), 
  }));

  return NextResponse.json(formattedCoupons);
}