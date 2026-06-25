export default function ResumeComparison({ originalText, optimizedJson }) {
  if (!originalText || !optimizedJson) return null;

  const { personal_info, summary, experience, projects, education, skills } = optimizedJson;

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-[#161d26] p-5 rounded-xl border border-[#232b35] overflow-y-auto max-h-[600px] shadow-lg">
        <h3 className="text-lg text-[#f0f0ec] font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span> Original Resume
        </h3>
        <div className="text-sm text-[#c9cbc5] whitespace-pre-wrap font-mono bg-[#1a1d22] p-4 rounded-lg border border-[#2c333e]">
          {originalText}
        </div>
      </div>
      
      <div className="flex-1 bg-[#ffffff] p-8 rounded-xl border border-[#00ffa3]/30 overflow-y-auto max-h-[600px] shadow-[0_0_15px_rgba(0,255,163,0.1)] text-black font-sans">
        {/* We use a white background and black text to simulate a real resume document */}
        
        {personal_info && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">{personal_info.full_name}</h1>
            <div className="text-sm text-gray-600 mt-1 flex flex-wrap justify-center gap-2">
              {personal_info.email && <span>{personal_info.email}</span>}
              {personal_info.phone && <span>| {personal_info.phone}</span>}
              {personal_info.location && <span>| {personal_info.location}</span>}
              {personal_info.linkedin && <span>| {personal_info.linkedin}</span>}
            </div>
            {personal_info.title && <p className="text-md font-medium text-gray-800 mt-1">{personal_info.title}</p>}
          </div>
        )}

        {summary && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">Professional Summary</h2>
            <p className="text-sm text-gray-700 text-justify">{summary}</p>
          </div>
        )}

        {skills && (skills.technical || skills.soft || skills.tools || skills.languages) && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">Skills</h2>
            <div className="text-sm text-gray-700 grid gap-1">
              {skills.technical && <p><span className="font-semibold">Technical:</span> {skills.technical}</p>}
              {skills.soft && <p><span className="font-semibold">Soft Skills:</span> {skills.soft}</p>}
              {skills.tools && <p><span className="font-semibold">Tools:</span> {skills.tools}</p>}
              {skills.languages && <p><span className="font-semibold">Languages:</span> {skills.languages}</p>}
            </div>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-md font-bold text-gray-900">{exp.position}</h3>
                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap ml-4">
                      {[exp.start_date, exp.end_date].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 italic mb-1">{exp.company}</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">Projects</h2>
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="text-md font-bold text-gray-900 mb-1">{proj.name}</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">Education</h2>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-md font-bold text-gray-900">{edu.school}</h3>
                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap ml-4">{edu.graduation_date}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{edu.degree}</span>
                    {edu.field && <span> in {edu.field}</span>}
                    {edu.gpa && <span> (GPA: {edu.gpa})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
