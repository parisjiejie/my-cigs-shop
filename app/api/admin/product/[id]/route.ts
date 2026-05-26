import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';

// 1. 定义标准的 Context 类型 (Next.js 16 要求 params 必须是 Promise)
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 2. PUT 方法 (修改)
export async function PUT(
  request: Request,
  context: RouteContext // 使用上面定义的类型
) {
  try {
    await dbConnect();
    
    // 关键修正：先 await context.params 拿到 id
    const { id } = await context.params;
    const body = await request.json();

    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ error: "产品不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 3. DELETE 方法 (删除)
export async function DELETE(
  request: Request,
  context: RouteContext // 使用上面定义的类型
) {
  try {
    await dbConnect();
    
    // 关键修正：同样先 await context.params
    const { id } = await context.params;
    
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}