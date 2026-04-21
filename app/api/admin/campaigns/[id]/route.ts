import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/lib/models/Campaign';

type RouteContext = { params: Promise<{ id: string }> };

// 获取单个活动
export async function GET(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const campaign = await Campaign.findById(id);
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// 更新
export async function PUT(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();
    const updated = await Campaign.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// 删除
export async function DELETE(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    await Campaign.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}