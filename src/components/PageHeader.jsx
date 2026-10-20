import { useEffect } from 'react';
import campaignConfig from '../config/campaignConfig.js';

/** Page banner. Also sets the browser tab title for the page. */
export default function PageHeader({ eyebrow, title, children }) {
  useEffect(() => {
    document.title = `${title} | ${campaignConfig.candidate.shortName} - ${campaignConfig.candidate.university}`;
  }, [title]);
  return (
    <section className="page-header">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
    </section>
  );
}
