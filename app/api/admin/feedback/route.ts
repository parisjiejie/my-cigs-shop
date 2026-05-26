import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/lib/models/Feedback';

export async function GET() {
  await dbConnect();
  // 按状态排序 (Pending 在前)，然后按时间倒序
  const items = await Feedback.find({}).sort({ status: -1, createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newItem = await Feedback.create(body);
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}