import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    const adminEmail = "admin@mycigsaustralia.com";
    const adminPassword = "admin123"; // 初始密码

    // 1. 检查是否已存在
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return NextResponse.json({ message: "管理员账号已存在，无需创建。" });
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. 创建管理员
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin", // 关键：设置为 admin 角色
      referralCode: "ADMIN001"
    });

    return NextResponse.json({ 
      message: "管理员创建成功！",
      email: adminEmail,
      password: adminPassword 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}