export default function PageHeader({ eyebrow = 'Scanly', title, subtitle, actions }) {
  return (
    <section className="page-hero">
      <div className="page-hero-grid" />
      <div className="page-hero-glow" />
      <div className="page-hero-inner">
        <div>
          {eyebrow && (
            <div className="page-hero-eyebrow">
              <span className="blip" />
              {eyebrow}
            </div>
          )}
          <h1 className="page-hero-title">{title}</h1>
          {subtitle && <p className="page-hero-sub">{subtitle}</p>}
        </div>
        {actions && <div className="page-hero-actions">{actions}</div>}
      </div>
    </section>
  );
}
