import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Address from '@/lib/models/Address';

// 定义 Context 类型
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 删除地址 (DELETE)
export async function DELETE(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await context.params;
    const userId = (session.user as any).id;
    
    // 确保用户只能删除自己的地址
    const result = await Address.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// 更新地址 (PUT) - 修复：支持更新所有字段
export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await context.params;
    const userId = (session.user as any).id;
    const body = await request.json();

    // 1. 如果请求设为默认，先处理互斥逻辑
    if (body.isDefault) {
      // 把该用户所有其他地址的 isDefault 设为 false
      await Address.updateMany(
        { userId, _id: { $ne: id } }, // 排除当前正在编辑的 ID
        { isDefault: false }
      );
    }

    // 2. 核心修复：无论是否设为默认，都执行全量字段更新
    // 这样不仅更新 isDefault，也会更新 email, phone, addressLine1 等所有传来的数据
    const updatedAddress = await Address.findByIdAndUpdate(
        id, 
        { ...body, userId }, // 确保 userId 不被篡改，且更新所有 body 字段
        { new: true }
    );

    if (!updatedAddress) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}