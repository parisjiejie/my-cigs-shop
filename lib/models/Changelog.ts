import mongoose from 'mongoose';

const ChangelogSchema = new mongoose.Schema({
  // 版本号 (例如 v1.0.1)
  version: { type: String, required: true, unique: true },
  
  // 更新内容描述
  content: { type: String, required: true },
  
  // 关联解决了哪些 Feedback
  resolvedFeedbackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
  
  // 发布日期
  releaseDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Changelog || mongoose.model('Changelog', ChangelogSchema);