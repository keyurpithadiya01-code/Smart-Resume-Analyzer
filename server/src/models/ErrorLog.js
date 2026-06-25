import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stack: { type: String },
    method: { type: String },
    url: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('ErrorLog', errorLogSchema);
