import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Campaign from '@/lib/models/Campaign';

export async function GET() {
  await dbConnect();
  // 按创建时间倒序
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // 简单验证
    if (!body.name || !body.type) {
        return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const newCampaign = await Campaign.create(body);
    return NextResponse.json(newCampaign);
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}