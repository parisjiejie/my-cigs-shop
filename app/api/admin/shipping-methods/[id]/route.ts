import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingMethod from '@/lib/models/ShippingMethod';

type RouteContext = { params: Promise<{ id: string }> };

// 修改 (PUT)
export async function PUT(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    const updated = await ShippingMethod.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// 删除 (DELETE)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
    await ShippingMethod.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}