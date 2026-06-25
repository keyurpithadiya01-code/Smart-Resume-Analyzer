export default function ResumeComparison({ originalText, optimizedJson }) {
  if (!originalText || !optimizedJson) return null;

  const { personal_info, sections } = optimizedJson;

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

        {sections && Array.isArray(sections) && sections.map((sec, idx) => (
          <div key={idx} className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase tracking-wide">
              {sec.heading}
            </h2>
            <div className="space-y-4">
              {sec.items && Array.isArray(sec.items) && sec.items.map((item, i) => (
                <div key={i}>
                  {(item.title || item.subtitle || item.date) && (
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        {item.title && <span className="text-md font-bold text-gray-900">{item.title}</span>}
                        {item.subtitle && <span className="text-sm font-semibold text-gray-700 italic ml-1">at {item.subtitle}</span>}
                      </div>
                      {item.date && (
                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap ml-4">
                          {item.date}
                        </span>
                      )}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap text-justify mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
