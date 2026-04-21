import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuest: { type: Boolean, default: false },
  
  orderNumber: { type: String, required: true, unique: true },
  
  // ⚠️ 关键修复：支付提醒相关字段 (之前漏掉的部分)
  paymentReminderStopped: { type: Boolean, default: false }, // 是否停止提醒
  lastPaymentReminderDate: { type: Date }, // 上次发送提醒的时间
  
  // 收货信息 (加强验证)
  shippingInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }, // 必须有邮箱，用于发通知
    addressLine1: { type: String, required: true },
    addressLine2: { type: String }, // 可选
    city: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  
  // 商品快照
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  }],
  
  // 金额计算
  itemsTotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  
  // 物流信息
  trackingNumber: { type: String },
  carrier: { type: String },
  shippedAt: { type: Date },
  
  // 支付备注 (保留)
  paymentProof: { type: String },

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);