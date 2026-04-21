import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingMethod from '@/lib/models/ShippingMethod';

// 获取列表 (GET)
export async function GET() {
  await dbConnect();
  const methods = await ShippingMethod.find({}).sort({ order: 1 });
  return NextResponse.json(methods);
}

// 创建新方式 (POST)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

    const newMethod = await ShippingMethod.create(body);
    return NextResponse.json(newMethod);
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}