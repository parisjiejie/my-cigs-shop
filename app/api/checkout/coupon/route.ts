import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/lib/models/Coupon';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 优惠券仅限会员使用，游客不能使用
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Coupons are for members only. Please log in.' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { code, cartTotal } = await request.json(); // 接收优惠券代码和购物车总额

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }
    
    // 1. 查找优惠券
    const coupon = await Coupon.findOne({ code }).lean();
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    // 2. 检查所有规则
    if (coupon.userId.toString() !== (session.user as any).id) {
        return NextResponse.json({ error: 'This coupon does not belong to your account.' }, { status: 403 });
    }
    if (coupon.isUsed) {
      return NextResponse.json({ error: 'This coupon has already been used.' }, { status: 400 });
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }
    // 检查订单金额是否达到最低要求 (满 $100 可用)
    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order amount for this coupon is $${coupon.minOrderAmount.toFixed(2)}.` }, { status: 400 });
    }

    // 3. 返回优惠券信息
    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount,
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}