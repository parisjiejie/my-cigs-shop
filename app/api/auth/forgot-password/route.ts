import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/email'; // 引入我们自己的邮件工具
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    
    // 为了安全，即使用户不存在，也返回成功，防止恶意探测账号
    if (!user) {
      return NextResponse.json({ success: true, message: 'If that email exists, we have sent a reset link.' });
    }

    // 1. 生成随机 Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1小时后过期

    // 2. 保存 Token 到数据库
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // 3. 构建重置链接 (自动适配本地或线上域名)
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    // 4. 发送邮件 (使用 SMTP)
    await sendEmail({
        to: email,
        subject: 'Reset Password - My Cigs Australia',
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link expires in 1 hour.</p>
        `
    });

    return NextResponse.json({ success: true, message: 'Reset link sent.' });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}