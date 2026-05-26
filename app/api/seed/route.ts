import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../../lib/models/Product';
// 初始数据
// ... 上面的 import 不动 ...

// 这里是新的数据，图片指向了 public/products 文件夹
const SEED_PRODUCTS = [
  { 
    name: 'Manchester Royal Red (10 Packets)', 
    price: 132.00, 
    // 注意：路径是以 / 开头的，对应 public 文件夹
    image: '/products/manchester.jpg', 
    category: 'Cigarettes', 
    brand: 'Manchester' 
  },
  { 
    name: 'Marlboro Gold Soft Pack', 
    price: 117.00, 
    image: '/products/marlboro.jpg', 
    category: 'Cigarettes', 
    brand: 'Marlboro' 
  },
  { 
    name: 'Benson & Hedges Gold', 
    price: 131.00, 
    image: '/products/benson.jpg', 
    category: 'Cigarettes', 
    brand: 'Benson & Hedges' 
  },
  { 
    name: 'Esse Change (Slims)', 
    price: 115.00, 
    image: '/products/esse.jpg', 
    category: 'Slims', 
    brand: 'Esse' 
  }
];

// ... 下面的 export async function GET ... 不动
export async function GET() {
  try {
    await dbConnect();
    
    // 1. 先清空旧数据（防止重复点击导致越来越多）
    await Product.deleteMany({});
    
    // 2. 插入新数据
    await Product.insertMany(SEED_PRODUCTS);

    return NextResponse.json({ message: '数据库初始化成功！产品已入库。' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}