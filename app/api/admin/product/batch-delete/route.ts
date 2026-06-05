import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }

    await dbConnect();

    const validIds = ids.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
    const result = await Product.deleteMany({ _id: { $in: validIds } });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Batch delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
