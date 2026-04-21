import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/lib/models/Category';

// 获取所有分类 (GET)
export async function GET() {
  await dbConnect();
  // 按 order 字段排序 (1, 2, 3...)
  const categories = await Category.find({}).sort({ order: 1 });
  return NextResponse.json(categories);
}

// 创建新分类 (POST)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    // 自动生成 slug (例如 "Vape Pens" -> "vape-pens")
    // 如果前端没传 slug，我们就自己生成一个
    const slug = body.slug || body.name.toLowerCase().trim().replace(/[\s]+/g, '-').replace(/[^\w-]+/g, '');

    // 检查 slug 是否重复
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: '该分类 Slug 已存在，请换一个' }, { status: 400 });
    }

    const newCategory = await Category.create({
      name: body.name,
      slug: slug,
      image: body.image || '',
      order: body.order || 0,
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}