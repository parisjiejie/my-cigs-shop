import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import { generateSlug } from '@/lib/slugify';

// 检查 slug 是否规范：直接用 generateSlug 对比，永远保持对齐
function isSlugClean(slug: string): boolean {
  return slug === generateSlug(slug);
}

// GET：预览哪些产品的 slug 不规范（不修改数据）
// POST：执行修复
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const allProducts = await Product.find({}).lean();
    
    const bad: { _id: string; name: string; currentSlug: string; suggestedSlug: string }[] = [];
    
    for (const p of allProducts) {
      const currentSlug = String(p.slug);
      const suggestedSlug = generateSlug(currentSlug); // 直接规范化现有 slug
      
      if (!isSlugClean(currentSlug)) {
        bad.push({
          _id: (p as any)._id.toString(),
          name: String(p.name),
          currentSlug,
          suggestedSlug,
        });
      }
    }
    
    return NextResponse.json({
      total: allProducts.length,
      needFix: bad.length,
      items: bad,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const allProducts = await Product.find({});
    
    const fixed: { name: string; oldSlug: string; newSlug: string }[] = [];
    const errors: string[] = [];
    
    for (const p of allProducts) {
      const currentSlug = String(p.slug);
      const newSlug = generateSlug(currentSlug);
      
      if (isSlugClean(currentSlug)) continue;
      
      // 检查新 slug 是否与已有产品的 slug 冲突（排除自身）
      const existing = await Product.findOne({ 
        slug: newSlug, 
        _id: { $ne: p._id } 
      });
      
      let finalSlug = newSlug;
      if (existing) {
        finalSlug = `${newSlug}-${Math.floor(Math.random() * 1000)}`;
      }
      
      try {
        await Product.findByIdAndUpdate(p._id, { slug: finalSlug });
        fixed.push({
          name: String(p.name),
          oldSlug: currentSlug,
          newSlug: finalSlug,
        });
      } catch (err: any) {
        errors.push(`${p.name}: ${err.message}`);
      }
    }
    
    return NextResponse.json({
      total: allProducts.length,
      fixed: fixed.length,
      errors,
      items: fixed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
