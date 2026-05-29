import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    if (!products || products.length === 0) {
        return NextResponse.json([]);
    }

    const formatted = products.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name || 'Unnamed Product',
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      image: p.image || p.images?.[0],
      category: p.category?.toString()
    }));

    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error("Failed to fetch product list:", error);
    return NextResponse.json([]);
  }
}