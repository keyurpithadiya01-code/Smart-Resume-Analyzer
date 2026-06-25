import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: '' },
    emailVerified: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'superadmin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
