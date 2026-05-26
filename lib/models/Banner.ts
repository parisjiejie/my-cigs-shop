import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String }, // 点击跳到哪
  order: { type: Number, default: 0 }, // 排序
  isActive: { type: Boolean, default: true }, // 是否显示
  position: { type: String, default: 'home_top' } // 位置
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);