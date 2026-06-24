import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    atsScore: { type: Number, default: 0 },
    keywordMatchScore: { type: Number, default: 0 },
    formatScore: { type: Number, default: 0 },
    sectionScore: { type: Number, default: 0 },
    missingSkills: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    fullResult: { type: mongoose.Schema.Types.Mixed, default: {} },
    targetRole: { type: String, default: '' },
    targetCategory: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
