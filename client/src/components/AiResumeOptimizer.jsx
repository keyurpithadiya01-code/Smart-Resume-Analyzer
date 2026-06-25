import { useState } from 'react';
import api from '../api/client';
import SkillSelection from './SkillSelection';
import ResumeViewer from './ResumeViewer';
import DownloadResumeButton from './DownloadResumeButton';

export default function AiResumeOptimizer({ analysisResult, setError }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizedResumeId, setOptimizedResumeId] = useState(null);
  const [optimizedJson, setOptimizedJson] = useState(null);

  const generateImprovedResume = async () => {
    if (!analysisResult) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const payload = {
        resumeText: analysisResult.resumeText,
        selectedSkills,
        atsScore: analysisResult.atsScore
      };
      
      const { data } = await api.post('/resume/optimize', payload);
      setOptimizedResumeId(data.optimizedResumeId);
      setOptimizedJson(data.optimizedResume);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate optimized resume');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!analysisResult) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto">
      {/* Left/Top Section: Checklist Card */}
      <div className="w-full lg:w-1/3 shrink-0">
        <div className="modern-card p-6 bg-[#0a0f16] border-[#00ffa3]/30 shadow-lg sticky top-6">
          <h3 className="text-xl font-bold text-[#00ffa3] mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Skill Injection
          </h3>
          
          <SkillSelection 
            missingSkills={analysisResult.missingSkills}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            onGenerate={generateImprovedResume}
            isGenerating={isGenerating}
            hasGenerated={!!optimizedJson}
          />
          
          {optimizedJson && (
            <div className="mt-6 pt-6 border-t border-[#232b35]">
              <p className="text-sm text-[#00ffa3] mb-4 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping"></span>
                Optimization Complete!
              </p>
              <DownloadResumeButton optimizedId={optimizedResumeId} />
            </div>
          )}
        </div>
      </div>

      {/* Right/Bottom Section: Resume Viewer */}
      <div className="w-full lg:w-2/3">
        <ResumeViewer 
          originalText={analysisResult.resumeText} 
          optimizedJson={optimizedJson} 
          defaultTab={optimizedJson ? "optimized" : "original"}
        />
      </div>
    </div>
  );
}
