import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import Coupon from '@/lib/models/Coupon'; // 引入 Coupon 模型

// 优惠券规则常量
const REFERRAL_COUPON_COUNT = 5;
const COUPON_DISCOUNT = 10.00;
const COUPON_MIN_ORDER = 100.00;
const EXPIRY_DAYS = 90; // 修改：有效期改为 90 天

// 生成随机推荐码
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'REF-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成一个唯一的优惠券代码
function generateCouponCode(prefix: string) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * 批量生成优惠券并存入数据库
 * @param userId 优惠券的归属用户 ID
 * @param count 优惠券数量
 * @param type 类型 ('referrer' | 'newuser')
 * @param referredNewUserId 推荐奖励券关联的新用户 ID (仅 referrer 类型需要)
 */
async function generateCouponsForUser(userId: mongoose.Types.ObjectId, count: number, type: 'referrer' | 'newuser', referredNewUserId?: mongoose.Types.ObjectId) {
    const coupons = [];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS); 

    for (let i = 0; i < count; i++) {
        coupons.push({
            userId,
            code: generateCouponCode(type === 'referrer' ? 'REF' : 'NEW'),
            type: 'referral',
            discountAmount: COUPON_DISCOUNT,
            minOrderAmount: COUPON_MIN_ORDER,
            expiresAt: expiryDate,
            referredNewUserId: referredNewUserId,
        });
    }
    await Coupon.insertMany(coupons);
}


export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, referralCode } = await request.json(); // 接收 referralCode

    // 1. 基本验证
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    // 3. 查找推荐人
    let referrer: any = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
    }

    // 4. 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. 创建新用户
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      referralCode: generateReferralCode(), // 给新用户也生成一个码
      referredBy: referrer ? referrer._id : null, // 记录推荐人 ID
    });
    
    // 6. 发放优惠券 (异步操作)
    if (newUser._id) {
        const newUserId = newUser._id as mongoose.Types.ObjectId;
        
        // 只有当有推荐人时才发放优惠券
        if (referrer) {
             // A. 给新人发 5 张券
             await generateCouponsForUser(newUserId, REFERRAL_COUPON_COUNT, 'newuser');
             
             // B. 给推荐人发 5 张券
             await generateCouponsForUser(referrer._id as mongoose.Types.ObjectId, REFERRAL_COUPON_COUNT, 'referrer', newUserId);
             
             console.log(`Coupons distributed for referral: ${referrer.email} -> ${email}`);
        }
    }


    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please log in.',
      userId: newUser._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration failed:', error);
    // 捕获数据库错误，返回标准 JSON
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 });
  }
}