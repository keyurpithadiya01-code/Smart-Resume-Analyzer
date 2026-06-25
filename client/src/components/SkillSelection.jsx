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
        Add skills that you work with to improve your resume & ATS.
      </p>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-2">
        {missingSkills.map(skill => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <label 
              key={skill} 
              className={`flex items-center space-x-4 cursor-pointer p-3.5 rounded-xl border transition-all duration-300 transform group ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#00ffa3]/10 to-transparent border-[#00ffa3]/50 shadow-[inset_4px_0_0_#00ffa3]' 
                  : 'bg-[#1a1d22] border-[#2c333e] hover:border-[#00ffa3]/30 hover:bg-[#1e2530]'
              }`}
            >
              <div className={`relative flex items-center justify-center w-5 h-5 rounded-[6px] border-[1.5px] transition-all duration-300 ${
                isSelected ? 'border-[#00ffa3] bg-[#00ffa3] shadow-[0_0_10px_rgba(0,255,163,0.5)]' : 'border-gray-500 bg-transparent group-hover:border-[#00ffa3]/50'
              }`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isSelected} 
                  onChange={() => toggleSkill(skill)} 
                />
                {/* Custom Checkmark */}
                <svg 
                  className={`w-4 h-4 text-[#0f141a] transition-transform duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-[15px] transition-colors duration-300 font-medium ${
                isSelected ? 'text-[#00ffa3]' : 'text-gray-300 group-hover:text-gray-100'
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
