import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Banner from '@/lib/models/Banner';

// 获取所有轮播图 (GET)
export async function GET() {
  await dbConnect();
  // 按位置分组，然后按排序数字从小到大排序
  const banners = await Banner.find({}).sort({ position: 1, order: 1 });
  return NextResponse.json(banners);
}

// 创建新轮播图 (POST)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.imageUrl) {
      return NextResponse.json({ error: '图片地址不能为空' }, { status: 400 });
    }

    const newBanner = await Banner.create(body);
    return NextResponse.json(newBanner);
  } catch (error) {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}