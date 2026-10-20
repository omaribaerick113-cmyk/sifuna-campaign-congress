import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import FeedbackForm from '../components/FeedbackForm.jsx';

export default function Feedback() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Your voice matters">
        Share suggestions and concerns about academic support, careers, welfare, communication and more.
      </PageHeader>
      <section className="section">
        <div className="container narrow">
          <p className="privacy-strip"><Lock size={16} aria-hidden="true" /> Feedback is stored privately. <Link to="/privacy">Read the privacy notice</Link>.</p>
          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
