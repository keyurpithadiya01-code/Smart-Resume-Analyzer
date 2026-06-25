import React from 'react';
import CircularGauge from '../CircularGauge';

export default function ResumePreviewModal({ isOpen, user, onClose }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#0d1117]/80 backdrop-blur-sm">
      <div className="bg-[#161b22] border-l border-[#30363d] w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#f0f6fc]">{user.name}'s Resume</h2>
            <p className="text-sm text-[#8b949e]">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#30363d] rounded-full transition-colors text-[#8b949e] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start gap-8 mb-10">
            <div className="shrink-0">
              <CircularGauge score={84} size="lg" variant="scan" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#f0f6fc] mb-2">ATS Analysis Summary</h3>
              <p className="text-[#8b949e] text-sm leading-relaxed mb-4">
                This resume demonstrates strong keyword matching for senior engineering roles. However, impact metrics are missing in the most recent experience section.
              </p>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#00ffa3]/10 text-[#00ffa3] text-xs font-medium border border-[#00ffa3]/20">Strong Keywords</span>
                <span className="px-2.5 py-1 rounded-md bg-[#ffb454]/10 text-[#ffb454] text-xs font-medium border border-[#ffb454]/20">Missing Metrics</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1117] rounded-xl p-8 border border-[#30363d] text-[#c9d1d9] font-serif leading-loose">
            <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
            <p className="mb-6 border-b border-[#30363d] pb-6">{user.email} • San Francisco, CA</p>
            
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider text-sm">Experience</h2>
            <div className="mb-6">
              <div className="flex justify-between font-medium text-white mb-1">
                <span>Senior Software Engineer</span>
                <span>2020 - Present</span>
              </div>
              <p className="mb-2 italic">Tech Corp Inc.</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Architected and deployed scalable microservices using Node.js and React.</li>
                <li>Reduced API latency by 40% through Redis caching implementation.</li>
                <li>Led a team of 4 engineers to deliver the new analytics dashboard.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
