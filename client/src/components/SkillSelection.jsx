export default function SkillSelection({ missingSkills, selectedSkills, setSelectedSkills, onGenerate, isGenerating, hasGenerated }) {
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-400 mt-2">
          Great job! We didn't find any critical missing skills for your resume based on our general ATS analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-400 mt-2 mb-4">
        We found the following skills missing from your resume that could improve your ATS score.
      </p>
      
      <div className="bg-[#ffb454]/10 border border-[#ffb454]/20 p-3 rounded-lg mb-4">
        <p className="text-sm text-[#ffb454] font-semibold">
          ⚠️ Warning: Only select skills that you genuinely possess. 
          ATS optimization should honestly reflect your capabilities.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-2">
        {missingSkills.map(skill => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <label 
              key={skill} 
              className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl border transition-all duration-300 transform ${
                isSelected 
                  ? 'bg-[#00ffa3]/10 border-[#00ffa3] shadow-[0_0_15px_rgba(0,255,163,0.2)] scale-[1.02]' 
                  : 'bg-[#1e2530] border-[#374151] hover:border-[#00ffa3]/50 hover:bg-[#1a212b]'
              }`}
            >
              <div className={`relative flex items-center justify-center w-6 h-6 rounded-md border-2 transition-colors duration-300 ${
                isSelected ? 'border-[#00ffa3] bg-[#00ffa3]' : 'border-gray-500 bg-[#161d26]'
              }`}>
                {/* Custom Checkmark */}
                <svg 
                  className={`w-4 h-4 text-[#0f141a] transition-transform duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-md transition-colors duration-300 font-medium ${
                isSelected ? 'text-[#00ffa3]' : 'text-gray-200'
              }`}>{skill}</span>
            </label>
          );
        })}
      </div>

      {!hasGenerated && (
        <button 
          onClick={onGenerate}
          disabled={isGenerating || selectedSkills.length === 0}
          className="btn-primary w-full mt-6 shadow-[0_0_15px_rgba(0,255,163,0.2)]"
        >
          {isGenerating ? 'Injecting Skills & Generating...' : 'Generate Improved Resume →'}
        </button>
      )}
      
      {hasGenerated && (
         <button 
         onClick={onGenerate}
         disabled={isGenerating || selectedSkills.length === 0}
         className="w-full mt-6 px-4 py-3 rounded-lg font-bold transition-all duration-300 bg-[#1a1d22] text-[#00ffa3] border border-[#00ffa3] hover:bg-[#00ffa3]/10 disabled:opacity-50"
       >
         {isGenerating ? 'Regenerating...' : 'Update & Regenerate'}
       </button>
      )}
    </div>
  );
}
