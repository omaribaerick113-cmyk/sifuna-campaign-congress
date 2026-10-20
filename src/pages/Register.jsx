import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';

export default function Register() {
  return (
    <>
      <PageHeader eyebrow="Register" title="Join the campaign">
        Show your support and help shape the priorities.
      </PageHeader>
      <section className="section">
        <div className="container narrow">
          <p className="privacy-strip"><Lock size={16} aria-hidden="true" /> Stored privately, never shown publicly. <Link to="/privacy">Read the privacy notice</Link>.</p>
          <RegistrationForm />
        </div>
      </section>
    </>
  );
}
