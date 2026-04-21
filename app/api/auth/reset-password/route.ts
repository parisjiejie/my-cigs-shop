import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { token, newPassword } = await request.json();

    // 1. 查找匹配 Token 且未过期的用户
    // $gt 表示 "greater than" (大于)，即过期时间必须在当前时间之后
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    // 2. 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 3. 更新用户信息
    user.password = hashedPassword;
    
    // 4. 清除 Token (防止重复使用)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}