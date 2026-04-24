import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  // 固定 ID
  key: { type: String, default: 'global_settings', unique: true },
  
  // 网站基础配置
  siteName: { type: String, default: 'My Cigs Australia' },
  theme: { type: String, enum: ['simple', 'brand'], default: 'simple' },
  
  // SMTP 邮件配置 (新增)
  smtpHost: { type: String }, // 例如 smtp.gmail.com
  smtpPort: { type: Number, default: 465 }, // 465 (SSL) 或 587 (TLS)
  smtpUser: { type: String }, // 您的邮箱账号
  smtpPassword: { type: String }, // 您的邮箱密码或应用专用密码
  smtpFrom: { type: String }, // 发件人显示名称，例如 "My Cigs <admin@...>"
  
  // 管理员通知邮箱
  adminEmail: { type: String }, // 管理员接收订单通知的邮箱
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);