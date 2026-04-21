import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/lib/models/Settings';

export async function GET() {
  await dbConnect();
  // 查找唯一的配置记录，如果没有就创建一个默认的
  let settings = await Settings.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await Settings.create({ key: 'global_settings' });
  }
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // 更新配置
    const settings = await Settings.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: body }, // 只更新传入的字段
      { new: true, upsert: true } // 如果不存在则创建
    );

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}