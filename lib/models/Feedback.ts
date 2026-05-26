import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  // a) 针对页面
  pageType: { type: String, enum: ['Client', 'Admin'], required: true },
  pageName: { type: String, required: true }, // 例如 "Checkout Page", "Order List"
  
  // b) 现在的问题
  issue: { type: String, required: true },
  
  // c) 希望实现的效果
  expectation: { type: String, required: true },
  
  // d) 更新状态
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], 
    default: 'Pending' 
  },
  
  // e) 关联的更新日志版本 (用于反查是在哪个版本修复的)
  fixedInVersion: { type: String },

  // f) 优先级
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);