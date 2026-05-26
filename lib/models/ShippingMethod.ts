import mongoose from 'mongoose';

const ShippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 快递名称 (e.g. "Express Post")
  price: { type: Number, required: true }, // 价格 (e.g. 25.00)
  description: { type: String }, // 描述 (e.g. "1-2 business days")
  order: { type: Number, default: 0 }, // 排序权重
  isActive: { type: Boolean, default: true }, // 是否启用
}, { timestamps: true });

export default mongoose.models.ShippingMethod || mongoose.model('ShippingMethod', ShippingMethodSchema);