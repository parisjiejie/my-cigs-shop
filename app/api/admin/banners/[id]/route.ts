import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/lib/models/Banner';

// 定义 Context 类型 (适配 Next.js 16)
// params 必须定义为 Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 修改轮播图 (PUT)
export async function PUT(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    
    // 关键修正：先 await context.params 拿到 id
    const { id } = await context.params;
    const body = await request.json();

    const updatedBanner = await Banner.findByIdAndUpdate(id, body, { new: true });

    if (!updatedBanner) {
      return NextResponse.json({ error: "轮播图不存在" }, { status: 404 });
    }

    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除轮播图 (DELETE)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    
    // 关键修正：同样先 await context.params
    const { id } = await context.params;
    
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}