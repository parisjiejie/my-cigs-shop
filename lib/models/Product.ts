import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // slug 是为了让网址更好看，比如 /product/marlboro-gold
  slug: { type: String, required: true, unique: true },
  
  // 关联分类表 (不再是简单的字符串)
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String },
  
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // 原价 (划线价)
  
  // 图片改为数组，支持多张图
  images: [{ type: String }], 
  // 兼容旧数据的字段 (以后会逐步弃用)
  image: { type: String }, 
  
  description: { type: String }, // 详细描述
  specifications: { type: String }, // 规格
  
  // 库存管理
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 }, // 低于多少显示"所剩不多"
  
  isFeatured: { type: Boolean, default: false }, // 是否推荐
  isActive: { type: Boolean, default: true }, // 上下架
  
  salesCount: { type: Number, default: 0 }, // 销量
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);