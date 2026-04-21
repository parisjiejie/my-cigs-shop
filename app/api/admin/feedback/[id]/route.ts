import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Feedback from '@/lib/models/Feedback';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();
    const updated = await Feedback.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    await Feedback.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}