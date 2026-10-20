export default function SectionHeading({ eyebrow, title, children, align = 'center', light = false }) {
  return (
    <div className={`section-heading align-${align} ${light ? 'on-dark' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </div>
  );
}
