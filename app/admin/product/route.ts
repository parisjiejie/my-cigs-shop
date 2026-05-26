import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product'; // 确保路径对，或者用相对路径 '../../../../lib/models/Product'

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // 简单验证
    if (!body.name || !body.price || !body.image) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    const newProduct = await Product.create(body);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}