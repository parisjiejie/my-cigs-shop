import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }, // 新增：必填的联系邮箱
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true }, 
  postcode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);