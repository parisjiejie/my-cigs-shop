import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { currentPassword, newPassword } = await request.json();
    const userId = (session.user as any).id;

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. 验证旧密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    // 2. 设置新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}