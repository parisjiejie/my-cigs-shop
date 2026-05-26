import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  
  siteName: { type: String, default: 'My Cigs Australia' },
  theme: { type: String, enum: ['simple', 'brand'], default: 'simple' },
  
  smtpHost: { type: String },
  smtpPort: { type: Number, default: 465 },
  smtpUser: { type: String },
  smtpPassword: { type: String },
  smtpFrom: { type: String },
  
  adminEmail: { type: String },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
