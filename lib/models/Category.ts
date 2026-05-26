import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // 例如: "Cigarettes"
  slug: { type: String, required: true, unique: true }, // 例如: "cigarettes" (用于网址)
  image: { type: String }, // 分类封面图
  order: { type: Number, default: 0 }, // 排序：数字越小越靠前
  isActive: { type: Boolean, default: true }, // 是否启用
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);