import { useState, useEffect } from 'react';

export default function ResumeViewer({ originalText, optimizedJson, defaultTab = 'optimized' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // When optimizedJson becomes available, auto-switch to optimized if we aren't already
  useEffect(() => {
    if (optimizedJson) {
      setActiveTab('optimized');
    }
  }, [optimizedJson]);

  if (!originalText) return null;

  const { personal_info, sections } = optimizedJson || {};

  return (
    <div className="mt-8 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Switcher Tabs */}
      <div className="flex justify-center mb-2">
        <div className="bg-[#1a1d22] p-1 rounded-full border border-[#2c333e] flex space-x-1">
          <button
            onClick={() => setActiveTab('original')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'original'
                ? 'bg-gray-700 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Original Resume
          </button>
          
          <button
            onClick={() => setActiveTab('optimized')}
            disabled={!optimizedJson}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'optimized'
                ? 'bg-[#00ffa3] text-[#0f141a] shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-not-allowed'
            }`}
            style={{ cursor: !optimizedJson ? 'not-allowed' : 'pointer' }}
          >
            {optimizedJson && <span className="w-2 h-2 rounded-full bg-[#0f141a] animate-pulse"></span>}
            ATS Optimized
          </button>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="w-full bg-[#161d26] p-4 md:p-6 rounded-xl border border-[#00ffa3]/30 shadow-[0_0_20px_rgba(0,255,163,0.05)] relative flex flex-col">
        
        {/* Original Resume View */}
        {activeTab === 'original' && (
          <div className="w-full h-[700px] overflow-auto bg-[#0a0f16] rounded-lg border border-[#232b35] p-6 custom-scrollbar">
            <div className="text-sm text-[#c9cbc5] whitespace-pre-wrap font-mono">
              {originalText}
            </div>
          </div>
        )}

        {/* ATS Optimized View (A4 Document) */}
        {activeTab === 'optimized' && optimizedJson && (
          <div className="w-full h-[700px] overflow-auto bg-[#0a0f16] rounded-lg border border-[#232b35] p-4 md:p-6 custom-scrollbar flex justify-center">
            
            {/* A4 Document Container */}
            <div className="bg-white text-black font-sans p-6 md:p-10 shadow-2xl shrink-0" style={{ width: '794px', minHeight: '1123px', maxWidth: '100%' }}>
              
              {personal_info && (
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-gray-900 break-words">{personal_info.full_name}</h1>
                  <div className="text-xs md:text-sm text-gray-600 mt-2 flex flex-wrap justify-center gap-2">
                    {personal_info.email && <span>{personal_info.email}</span>}
                    {personal_info.phone && <span className="hidden md:inline">|</span>}
                    {personal_info.phone && <span>{personal_info.phone}</span>}
                    {personal_info.location && <span className="hidden md:inline">|</span>}
                    {personal_info.location && <span>{personal_info.location}</span>}
                    {personal_info.linkedin && <span className="hidden md:inline">|</span>}
                    {personal_info.linkedin && <span>{personal_info.linkedin}</span>}
                  </div>
                  {personal_info.title && <p className="text-md md:text-lg font-medium text-gray-800 mt-1">{personal_info.title}</p>}
                </div>
              )}

              {sections && Array.isArray(sections) && sections.map((sec, idx) => (
                <div key={idx} className="mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                    {sec.heading}
                  </h2>
                  <div className="space-y-4">
                    {sec.items && Array.isArray(sec.items) && sec.items.map((item, i) => (
                      <div key={i}>
                        {(item.title || item.subtitle || item.date) && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                            <div>
                              {item.title && <span className="text-md md:text-lg font-bold text-gray-900">{item.title}</span>}
                              {item.subtitle && <span className="text-sm md:text-md font-semibold text-gray-700 italic sm:ml-2 block sm:inline">at {item.subtitle}</span>}
                            </div>
                            {item.date && (
                              <span className="text-xs md:text-sm text-gray-600 font-bold sm:whitespace-nowrap mt-1 sm:mt-0">
                                {item.date}
                              </span>
                            )}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-sm md:text-md text-gray-700 whitespace-pre-wrap text-justify mt-1 break-words">
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
        )}
      </div>
    </div>
  );
}
