import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function seed() {
  await connectDB();
  const email = 'admin@example.com';
  const password = 'admin123';
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await Admin.create({ email, password: hash });
    console.log('Admin created:', email, '/', password);
  }
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
