import mongoose from 'mongoose';

const userResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Strict 1-to-1 relationship: A user only has one active saved resume
  },
  filename: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('UserResume', userResumeSchema);
