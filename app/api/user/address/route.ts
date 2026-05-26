import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Address from '@/lib/models/Address';

// 获取用户所有地址 (GET)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as any).id;
  
  const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  
  // 序列化
  const formattedAddresses = addresses.map((addr: any) => ({
    ...addr,
    _id: addr._id.toString(),
  }));

  return NextResponse.json(formattedAddresses);
}

// 新增用户地址 (POST)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await dbConnect();
    const userId = (session.user as any).id;
    const body = await request.json();

    // 1. 检查是否设为默认地址
    if (body.isDefault) {
      // 如果设置为默认，先把该用户其他地址的 isDefault 设为 false
      await Address.updateMany({ userId }, { isDefault: false });
    } else {
      // 如果没有设为默认，并且是该用户第一个地址，则强制设为默认
      const count = await Address.countDocuments({ userId });
      if (count === 0) {
        body.isDefault = true;
      }
    }

    // 2. 创建新地址
    const newAddress = await Address.create({
      ...body,
      userId,
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '创建地址失败' }, { status: 500 });
  }
}