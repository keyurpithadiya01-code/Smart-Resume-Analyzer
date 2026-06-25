import { useState } from 'react';
import api from '../api/client';
import SkillSelection from './SkillSelection';
import ResumeComparison from './ResumeComparison';
import DownloadResumeButton from './DownloadResumeButton';

export default function AiResumeOptimizer({ file, isSavedResume, savedResumeMeta, setError }) {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // { atsScore, missingSkills, resumeText }
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizedResumeId, setOptimizedResumeId] = useState(null);
  const [optimizedJson, setOptimizedJson] = useState(null);

  const runAnalysis = async () => {
    if (!file && !savedResumeMeta) {
      setError('Upload a PDF or DOCX resume first');
      return;
    }
    
    setLoadingAnalysis(true);
    setError('');
    setAnalysisResult(null);
    setOptimizedResumeId(null);
    setOptimizedJson(null);
    setSelectedSkills([]);
    
    try {
      const fd = new FormData();
      if (file) fd.append('resume', file);
      else if (isSavedResume) fd.append('useSavedResume', 'true');
      
      const { data } = await api.post('/resume/optimizer/analyze', fd);
      setAnalysisResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze resume');
    } finally {
      setLoadingAnalysis(false);
    }
  };

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

  return (
    <div className="mt-8">
      {!analysisResult && !loadingAnalysis && (
        <div className="flex justify-center mt-6">
          <button onClick={runAnalysis} className="btn-primary">
            Analyze for Optimization
          </button>
        </div>
      )}
      
      {loadingAnalysis && (
        <div className="flex justify-center mt-8 flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#00ffa3] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#00ffa3]">Analyzing your resume for missing skills...</p>
        </div>
      )}

      {analysisResult && !optimizedJson && (
        <SkillSelection 
          missingSkills={analysisResult.missingSkills}
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          onGenerate={generateImprovedResume}
          isGenerating={isGenerating}
        />
      )}

      {optimizedJson && (
        <div className="mt-8">
          <div className="modern-card p-6 bg-[#0a0f16] border-[#00ffa3]/40">
            <h2 className="text-2xl font-bold text-[#00ffa3] mb-2">Optimization Complete!</h2>
            <p className="text-[#c9cbc5]">Your resume has been rewritten to seamlessly incorporate your selected skills and improve ATS readability.</p>
            
            <DownloadResumeButton optimizedId={optimizedResumeId} />
          </div>
          
          <ResumeComparison 
            originalText={analysisResult.resumeText} 
            optimizedJson={optimizedJson} 
            optimizedId={optimizedResumeId}
          />
        </div>
      )}
    </div>
  );
}
