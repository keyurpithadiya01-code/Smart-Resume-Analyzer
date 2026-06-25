import mongoose from 'mongoose';

const optimizedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalResumeText: {
    type: String,
    required: true,
  },
  improvedResume: {
    type: Object, // Will store the JSON object returned by Gemini
    required: true,
  },
  selectedSkills: {
    type: [String],
    default: [],
  },
  atsScore: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('OptimizedResume', optimizedResumeSchema);
