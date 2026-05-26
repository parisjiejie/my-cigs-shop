import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // 1. 验证必填项 (移除 body.image 的验证)
    // 允许不填图片，前端会自动使用默认图
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Please fill in Name and Price.' }, { status: 400 });
    }

    // 2. 自动生成 slug
    let slug = body.slug;
    if (!slug) {
      slug = body.name.toLowerCase().trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w-]+/g, '');
    }

    // 3. 检查 slug 重复
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // 4. 创建产品
    const newProduct = await Product.create({
      ...body,
      slug,
      image: body.image || '', // 如果没填，存为空字符串
      category: body.category || null,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Add product failed:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}