import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Force load env
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local at', envPath);
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    const email = 'admin@mycigsaustralia.com';
    const password = 'admin123';
    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User ${email} already exists.`);
      console.log(`Current role: ${existingUser.role}`);
      
      if (existingUser.role !== 'admin') {
        console.log('Updating role to admin...');
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Role updated.');
      }
      
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
         console.log('Password does not match admin123. Updating password...');
         existingUser.password = await bcrypt.hash(password, 10);
         await existingUser.save();
         console.log('Password updated.');
      } else {
         console.log('Password already matches.');
      }
    } else {
      console.log(`User ${email} not found. Creating...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAdmin();
