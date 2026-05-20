import mongoose from 'mongoose';

// ==========================================
// 数据库连接配置
// ==========================================
// 本地开发环境 (.env.local) -> mycigsdb_dev (测试数据库)
// 正式环境 (.env.production) -> mycigsdb_prod (正式数据库)
// 注意：两个数据库完全独立，本地开发不会影响正式数据
// ==========================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // 确保这里抛出的错误不会被误认为是 HTML
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      // 增加连接选项，提高连接的稳定性
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, // 5秒后连接超时
    }).then((mongoose) => {
      return mongoose;
    }).catch(err => {
      // 如果连接失败，记录错误并重新抛出，防止应用卡死
      console.error("MongoDB Connection Error:", err);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;