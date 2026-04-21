import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';

// 定义 Context 类型 (Next.js 16)
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 修改分类 (PUT)
export async function PUT(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });

    if (!updatedCategory) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除分类 (DELETE)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}