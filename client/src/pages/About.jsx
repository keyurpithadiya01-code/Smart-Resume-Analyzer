import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

export default function About() {
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Scanly · About"
        title="About Scanly"
        subtitle="Smart resume analysis that reads your resume the way hiring software does — so you fix the right things before you hit submit."
      />

      <Reveal>
        <div className="split-panel">
          <div className="split-panel-left">
            <p className="form-section-label">Our Mission</p>
            <p className="text-[#c9cbc5] leading-relaxed text-[15px]">
              Scanly analyzes resumes for ATS compatibility, delivers AI-powered feedback via Google Gemini,
              helps you build DOCX resumes, and explore job portals — all in one modern workspace.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="scanly-dot" />
              <span className="font-display font-bold text-lg gradient-text animate-blink-cyan">Scanly</span>
              <span className="text-sm text-[#6b7785]">Smart Resume Analyzer</span>
            </div>
          </div>
          <div className="split-panel-right">
            <p className="form-section-label" style={{ color: '#00ffa3' }}>Tech Stack</p>
            <div className="space-y-4">
              {[
                ['Frontend', 'React, Vite, Tailwind CSS, Recharts'],
                ['Backend', 'Node.js, Express, MongoDB'],
                ['AI Engine', 'Google Gemini API'],
              ].map(([title, desc]) => (
                <div key={title} className="modern-card !p-4 lift">
                  <p className="text-[10px] uppercase tracking-wider text-[#00ffa3] mb-1">{title}</p>
                  <p className="text-sm text-[#c9cbc5]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
