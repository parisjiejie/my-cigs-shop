import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';

const productsToImport = [
  { name: 'Blueberry Blackberry Ice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Mango Ice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Grape Ice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Classic Coke', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Blackberry Cherry Pomegranate', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Strawberry Kiwi', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Passion Fruit Orange Guava', brand: 'UWELL', category: 'Vape', price: 40, stock: 40 },
  { name: 'Pineapple Icepop', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Mango Peach Watermelon', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Apple Juice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Black Dragon Ice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Blackcurrant Grape', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Tropical Rainbow Blast', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Mango Grapefruit Ice', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Lemon Mint', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Blueberry Pomegranate', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Kiwi Fuse', brand: 'UWELL', category: 'Vape', price: 40, stock: 10 },
  { name: 'Cosmic Blast (Raspberry Peach Lemon)', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Brooklyn Blue', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Spearmint Ice', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Kiwi Lemon Passion Fruit', brand: 'Dummy', category: 'Cigarette', price: 40, stock: 10 },
  { name: 'Banana Ice', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Mango', brand: 'Dummy', category: 'Vape', price: 40, stock: 0 },
  { name: 'Grape', brand: 'Dummy', category: 'Vape', price: 40, stock: 0 },
  { name: 'Clear', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Blackice', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Raspberry Peach Ice', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Blueberry', brand: 'Dummy', category: 'Vape', price: 40, stock: 0 },
  { name: 'Pineapple Mango Lime', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Watermelon Grape Mint', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Bad Berry (Blackberry Raspberry)', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Red Dummy (Strawberry Banana)', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Wacky Watermelon', brand: 'Dummy', category: 'Vape', price: 40, stock: 10 },
  { name: 'Manchester Reserver', brand: 'Manchester', category: 'Cigarette', price: 140, stock: 0 },
  { name: 'Manchester Royal Red', brand: 'Manchester', category: 'Cigarette', price: 140, stock: 0 },
  { name: 'Manchester Queen Gold', brand: 'Manchester', category: 'Cigarette', price: 140, stock: 0 },
  { name: 'Manchester Saphire Blue', brand: 'Manchester', category: 'Cigarette', price: 160, stock: 0 },
  { name: 'Manchester Special Edition', brand: 'Manchester', category: 'Cigarette', price: 160, stock: 14 },
  { name: 'Manchester Classic Gold', brand: 'Manchester', category: 'Cigarette', price: 140, stock: 0 },
  { name: 'Manchester Double Drive', brand: 'Manchester', category: 'Cigarette', price: 160, stock: 30 },
  { name: 'Benson Hedges Gold', brand: 'Benson Hedges', category: 'Cigarette', price: 140, stock: 9 },
  { name: 'Benson Hedges Special Filter', brand: 'Benson Hedges', category: 'Cigarette', price: 140, stock: 11 },
  { name: 'Double Happiness', brand: 'Double Happiness', category: 'Cigarette', price: 140, stock: 17 },
  { name: 'Marlboro Gold', brand: 'Marlboro', category: 'Cigarette', price: 160, stock: 10 },
  { name: 'Marlboro Red', brand: 'Marlboro', category: 'Cigarette', price: 160, stock: 20 },
  { name: 'Esse Light', brand: 'Esse', category: 'Cigarette', price: 140, stock: 9 },
  { name: 'Esse Change (Red Wine)', brand: 'Esse', category: 'Cigarette', price: 160, stock: 6 },
  { name: 'Esse Change (Orange)', brand: 'Esse', category: 'Cigarette', price: 160, stock: 20 },
  { name: 'Mac Ice Pop', brand: 'Mac', category: 'Cigarette', price: 160, stock: 2 },
  { name: 'Mevius Purple 8mg', brand: 'Mevius', category: 'Cigarette', price: 210, stock: 19 },
  { name: 'Davidoff Classic', brand: 'Davidoff', category: 'Cigarette', price: 200, stock: 0 },
  { name: 'Tower Chinese', brand: 'Marlboro', category: 'Cigarette', price: 140, stock: 8 },
  { name: 'Zhonghua Slim Chinese Red', brand: 'Zhonghua', category: 'Cigarette', price: 180, stock: 19 },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'No MONGODB_URI' }, { status: 500 });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }

    const categories = ['Vape', 'Cigarette'];
    const categoryMap = {};

    for (const catName of categories) {
      let cat = await Category.findOne({ name: catName });
      if (!cat) {
        cat = await Category.create({
          name: catName,
          slug: slugify(catName),
          isActive: true,
          order: categories.indexOf(catName)
        });
      }
      categoryMap[catName] = cat._id;
    }

    let imported = 0;
    let skipped = 0;

    for (const p of productsToImport) {
      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        skipped++;
        continue;
      }

      await Product.create({
        name: p.name,
        slug: slugify(p.name),
        category: categoryMap[p.category],
        brand: p.brand,
        price: p.price,
        originalPrice: p.price,
        stock: p.stock,
        isActive: true,
        isFeatured: false,
        images: []
      });

      imported++;
    }

    return NextResponse.json({ 
      success: true, 
      imported, 
      skipped,
      message: `Imported ${imported} products, skipped ${skipped} existing products`
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
