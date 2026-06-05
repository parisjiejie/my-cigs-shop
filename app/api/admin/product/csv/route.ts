import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { normalizeSlug, generateSlug } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    let products;
    if (ids) {
      const idArray = ids.split(',').filter(id => id.match(/^[0-9a-fA-F]{24}$/));
      products = await Product.find({ _id: { $in: idArray } })
        .populate('category', 'name')
        .lean();
    } else {
      products = await Product.find({})
        .populate('category', 'name')
        .lean();
    }

    const csvHeaders = [
      'name',
      'slug', 
      'category',
      'brand',
      'price',
      'originalPrice',
      'stock',
      'lowStockThreshold',
      'isFeatured',
      'isActive',
      'description',
      'specifications'
    ].join(',');

    const csvRows = products.map((p: any) => {
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCSV(p.name),
        escapeCSV(p.slug),
        escapeCSV(p.category?.name || ''),
        escapeCSV(p.brand || ''),
        escapeCSV(p.price),
        escapeCSV(p.originalPrice || ''),
        escapeCSV(p.stock),
        escapeCSV(p.lowStockThreshold || 5),
        escapeCSV(p.isFeatured ? 'true' : 'false'),
        escapeCSV(p.isActive ? 'true' : 'false'),
        escapeCSV(p.description || ''),
        escapeCSV(p.specifications || '')
      ].join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_${new Date().toISOString().slice(0,10)}.csv"`
      }
    });
  } catch (error: any) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or has no data rows' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const categories = await Category.find({}).lean();
    const categoryMap = new Map<string, string>();
    categories.forEach((c: any) => {
      categoryMap.set(c.name.toLowerCase(), c._id.toString());
    });

    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        if (!row.name) {
          results.skipped++;
          continue;
        }

        // 规范化 slug：如果没有填则从 name 生成，否则规范化已有值
        let importSlug = row.slug
          ? normalizeSlug(row.slug)
          : generateSlug(row.name);

        let categoryId = row.category ? categoryMap.get(row.category.toLowerCase()) : null;
        if (!categoryId && row.category) {
          const newCat = await Category.create({ name: row.category, slug: row.category.toLowerCase().replace(/\s+/g, '-') });
          categoryMap.set(row.category.toLowerCase(), newCat._id.toString());
          categoryId = newCat._id.toString();
        }

        const productData = {
          name: row.name,
          slug: importSlug,
          category: categoryId,
          brand: row.brand || undefined,
          price: parseFloat(row.price) || 0,
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
          stock: parseInt(row.stock) || 0,
          lowStockThreshold: parseInt(row.lowStockThreshold) || 5,
          isFeatured: row.isFeatured === 'true',
          isActive: row.isActive !== 'false',
          description: row.description || undefined,
          specifications: row.specifications || undefined
        };

        const existing = await Product.findOne({ slug: importSlug });
        if (existing) {
          await Product.findByIdAndUpdate(existing._id, productData);
        } else {
          await Product.create(productData);
        }
        
        results.success++;
      } catch (err: any) {
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message: `Import completed. Success: ${results.success}, Skipped: ${results.skipped}`,
      errors: results.errors.slice(0, 10)
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
