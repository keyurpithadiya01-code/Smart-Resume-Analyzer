export default function DownloadResumeButton({ optimizedId }) {
  if (!optimizedId) return null;

  const handleDownload = () => {
    // The browser will handle the PDF stream and trigger a download/view
    // We use the full API URL based on VITE_API_URL or relative if proxied
    const baseUrl = import.meta.env.VITE_API_URL || '';
    window.open(`${baseUrl}/api/resume/download/${optimizedId}`, '_blank');
  };

  return (
    <div className="mt-6 flex justify-end">
      <button 
        onClick={handleDownload}
        className="btn-primary flex items-center space-x-2 px-6 py-3 bg-[#00ffa3] hover:bg-[#00ffa3]/80 text-[#0f141a]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        <span className="font-bold">Download ATS PDF</span>
      </button>
    </div>
  );
}
