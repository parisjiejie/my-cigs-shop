import mongoose from 'mongoose';
import dbConnect from './lib/dbConnect';
import Category from './lib/models/Category';
import Product from './lib/models/Product';

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

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function migrate() {
  try {
    await dbConnect();
    console.log('Connected to database');

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
        console.log(`Created category: ${catName}`);
      }
      categoryMap[catName] = cat._id;
    }

    console.log('Categories ready:', categoryMap);

    let imported = 0;
    let skipped = 0;

    for (const p of productsToImport) {
      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        console.log(`Skipped (exists): ${p.name}`);
        skipped++;
        continue;
      }

      const product = await Product.create({
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

      console.log(`Imported: ${p.name}`);
      imported++;
    }

    console.log(`\nDone! Imported: ${imported}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrate();
