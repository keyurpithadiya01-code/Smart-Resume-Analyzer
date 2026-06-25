import { useState } from 'react';
import api from '../api/client';

export default function DownloadResumeButton({ optimizedId }) {
  const [downloading, setDownloading] = useState(false);

  if (!optimizedId) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/resume/download/${optimizedId}`, {
        responseType: 'blob', // Important for receiving binary data
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'optimized_resume.pdf');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-6 flex justify-end">
      <button 
        onClick={handleDownload}
        disabled={downloading}
        className="btn-primary flex items-center space-x-2 px-6 py-3 bg-[#00ffa3] hover:bg-[#00ffa3]/80 text-[#0f141a] disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        <span className="font-bold">{downloading ? 'Downloading...' : 'Download ATS PDF'}</span>
      </button>
    </div>
  );
}
