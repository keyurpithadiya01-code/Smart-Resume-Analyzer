export default function SkillSelection({ missingSkills, selectedSkills, setSelectedSkills, onGenerate, isGenerating }) {
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div className="modern-card lift mt-4 p-5">
        <h3 className="modern-card-title text-[#00ffa3]">Analysis Complete</h3>
        <p className="text-sm text-gray-400 mt-2">
          Great job! We didn't find any critical missing skills for your resume based on our general ATS analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="modern-card lift mt-4 p-5 border border-[#374151]">
      <h3 className="modern-card-title text-[#00ffa3]">Missing Skills Found</h3>
      <p className="text-sm text-gray-400 mt-2 mb-4">
        We found the following skills missing from your resume that could improve your ATS score.
      </p>
      
      <div className="bg-[#ffb454]/10 border border-[#ffb454]/20 p-3 rounded-lg mb-4">
        <p className="text-sm text-[#ffb454] font-semibold">
          ⚠️ Warning: Only select skills that you genuinely possess. 
          ATS optimization should honestly reflect your capabilities.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {missingSkills.map(skill => (
          <label key={skill} className="flex items-center space-x-2 cursor-pointer bg-[#1e2530] px-3 py-2 rounded-md border border-[#374151] hover:border-[#00ffa3]/50 transition">
            <input 
              type="checkbox" 
              className="form-checkbox h-4 w-4 text-[#00ffa3] rounded bg-[#161d26] border-gray-500 focus:ring-0 focus:ring-offset-0"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />
            <span className="text-sm text-gray-200">{skill}</span>
          </label>
        ))}
      </div>

      <button 
        onClick={onGenerate}
        disabled={isGenerating || selectedSkills.length === 0}
        className="btn-primary w-full sm:w-auto mt-6"
      >
        {isGenerating ? 'Generating...' : 'Generate Improved Resume →'}
      </button>
    </div>
  );
}
