import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category'; 

export const dynamic = 'force-dynamic'; // 强制动态，防止缓存

export async function GET() {
  try {
    console.log("👉 [API START] /api/admin/product/list called"); // 标记 API 开始

    await dbConnect();
    console.log("👉 [DB] Database connected successfully");

    // 1. 获取所有产品
    // 修复：在 populate 中显式指定 model: Category，解决 MissingSchemaError
    const products = await Product.find({})
      .select('name _id category')
      .populate({ path: 'category', select: 'name', model: Category }) 
      .lean();
    
    console.log(`👉 [DB] Found ${products ? products.length : 0} products in database`);

    if (!products || products.length === 0) {
        return NextResponse.json([]);
    }

    // 2. 格式化数据
    const formatted = products.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name || 'Unnamed Product',
      categoryName: p.category?.name || 'Uncategorized',
      categoryId: p.category?._id?.toString() || null,
    }));

    // 3. 排序
    formatted.sort((a, b) => {
        const catCompare = a.categoryName.localeCompare(b.categoryName);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
    });

    console.log("👉 [API SUCCESS] Returning formatted data");
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error("❌ [API ERROR] Failed to fetch product list:", error);
    // 返回空数组，但在控制台记录错误
    return NextResponse.json([]);
  }
}