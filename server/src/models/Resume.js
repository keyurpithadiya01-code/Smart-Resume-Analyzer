import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    summary: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    targetCategory: { type: String, default: '' },
    education: { type: mongoose.Schema.Types.Mixed, default: [] },
    experience: { type: mongoose.Schema.Types.Mixed, default: [] },
    projects: { type: mongoose.Schema.Types.Mixed, default: [] },
    skills: { type: mongoose.Schema.Types.Mixed, default: [] },
    template: { type: String, default: '' },
    formData: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
