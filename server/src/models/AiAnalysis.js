import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    modelUsed: { type: String, default: 'gemini' },
    resumeScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    jobRole: { type: String, default: '' },
    analysis: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AiAnalysis', aiAnalysisSchema);
