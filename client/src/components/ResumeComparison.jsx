import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ResumeComparison({ originalText, optimizedId }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!optimizedId) return;

    const fetchPdf = async () => {
      try {
        setLoadingPdf(true);
        setError('');
        const response = await api.get(`/resume/download/${optimizedId}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        setPdfUrl(url);
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
        setError('Failed to load PDF preview.');
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [optimizedId]); // We intentionally do not include pdfUrl in dependency array

  if (!originalText || !optimizedId) return null;

  return (
    <div className="mt-8 flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-[#161d26] p-5 rounded-xl border border-[#232b35] overflow-y-auto max-h-[800px] shadow-lg">
        <h3 className="text-lg text-[#f0f0ec] font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span> Original Resume Text
        </h3>
        <div className="text-sm text-[#c9cbc5] whitespace-pre-wrap font-mono bg-[#1a1d22] p-4 rounded-lg border border-[#2c333e]">
          {originalText}
        </div>
      </div>
      
      <div className="flex-1 bg-[#161d26] p-0 rounded-xl border border-[#00ffa3]/30 overflow-hidden h-[800px] shadow-[0_0_15px_rgba(0,255,163,0.1)] relative flex flex-col">
        <div className="p-4 border-b border-[#00ffa3]/30 bg-[#161d26] shrink-0">
          <h3 className="text-lg text-[#00ffa3] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse"></span> ATS Optimized PDF Preview
          </h3>
        </div>
        
        <div className="flex-1 relative w-full h-full bg-[#323639]">
          {loadingPdf && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#00ffa3] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400">
              {error}
            </div>
          )}
          
          {pdfUrl && !loadingPdf && (
            <iframe 
              src={`${pdfUrl}#view=FitH`} 
              className="w-full h-full border-none"
              title="Optimized Resume PDF Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
