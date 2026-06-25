import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';

async function fixUser() {
  await connectDB();
  
  const email = process.env.SUPERADMIN_EMAIL ? process.env.SUPERADMIN_EMAIL.toLowerCase().trim() : 'keyurpithadiya01@gmail.com';
  let user = await User.findOne({ email });
  
  if (!user) {
    console.log(`User ${email} not found. Creating a new one...`);
    const hashed = await bcrypt.hash('Admin@123!', 10);
    user = await User.create({
      email,
      password: hashed,
      name: 'Super Admin',
      emailVerified: true,
      role: 'superadmin'
    });
    console.log(`Created user ${email} with password: Admin@123!`);
  } else {
    console.log(`User ${email} found. Upgrading role and resetting password...`);
    user.role = 'superadmin';
    const hashed = await bcrypt.hash('Admin@123!', 10);
    user.password = hashed;
    await user.save();
    console.log(`Updated user ${email} to superadmin with password: Admin@123!`);
  }
  process.exit(0);
}

fixUser().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
