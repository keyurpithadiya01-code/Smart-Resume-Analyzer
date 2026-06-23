export default function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="pill-tabs">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={active === id ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
