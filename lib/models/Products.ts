import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'Cigarettes' },
  brand: { type: String },
  stock: { type: Number, default: 100 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);