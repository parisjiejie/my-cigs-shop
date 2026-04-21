import dotenv from 'dotenv';
dotenv.config(); // This will look for .env by default. Let's try .env.local specifically.
dotenv.config({ path: './.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dbConnect from './lib/dbConnect';
import User from './lib/models/User';

async function checkAdmin() {
  try {
    await dbConnect();
    const email = 'admin@mycigsaustralia.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} NOT FOUND in database.`);
      
      // Let's also list all users to see what's there
      const allUsers = await User.find({}, { email: 1, role: 1 });
      console.log('All users in DB:', allUsers);
    } else {
      console.log(`User ${email} FOUND.`);
      console.log(`Role: ${user.role}`);
      
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log(`Password 'admin123' matches: ${isMatch}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
