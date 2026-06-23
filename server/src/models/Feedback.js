import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    usabilityScore: { type: Number, required: true, min: 1, max: 5 },
    featureSatisfaction: { type: Number, required: true, min: 1, max: 5 },
    missingFeatures: { type: String, default: '' },
    improvementSuggestions: { type: String, default: '' },
    userExperience: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
