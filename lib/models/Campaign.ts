import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 活动名称，如 "Opening Sale"
  description: { type: String }, // 前台显示的文案
  type: { 
    type: String, 
    enum: ['buy_x_get_y', 'tiered_discount', 'free_shipping'], 
    required: true 
  },
  
  isActive: { type: Boolean, default: true },
  
  // 适用范围
  scope: { type: String, enum: ['all', 'specific'], default: 'all' }, // 全店 or 指定产品
  targetProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // 指定参与的产品 ID
  
  // 规则配置 (根据 type 不同而不同)
  rules: {
    // 14-1: 同产品每满 5 赠 1
    // buyQuantity: 5, getQuantity: 1
    buyQuantity: { type: Number }, 
    getQuantity: { type: Number },
    
    // 14-2: 每满 300 减 20
    // minSpend: 300, discountAmount: 20
    minSpend: { type: Number },
    discountAmount: { type: Number },
    
    // 14-4: 满 300 包邮
    // freeShippingThreshold: 300
    freeShippingThreshold: { type: Number }
  },
  
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);