import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
  
  // 推荐系统
  referralCode: { type: String, unique: true, sparse: true }, 
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  
  // 默认地址
  defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

  // 新增：找回密码专用字段
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);