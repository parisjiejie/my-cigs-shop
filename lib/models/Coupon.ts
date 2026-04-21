import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 归属用户
  code: { type: String, required: true, unique: true }, // 优惠券代码 (唯一)
  type: { type: String, enum: ['referral', 'marketing'], default: 'referral' },
  
  // 优惠券规则
  discountAmount: { type: Number, default: 10.00 }, // 优惠金额 ($10)
  minOrderAmount: { type: Number, default: 100.00 }, // 最小订单金额 ($100)
  
  // 状态与有效期
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true }, // 60天有效期
  
  // 关联信息
  referredNewUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 如果是推荐奖励，关联新人ID
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);