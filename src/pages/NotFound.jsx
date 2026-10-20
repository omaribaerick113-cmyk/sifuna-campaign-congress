import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found">That page does not exist.</PageHeader>
      <section className="section">
        <div className="container center-text">
          <Link to="/" className="btn btn-gold">Back to home</Link>
        </div>
      </section>
    </>
  );
}
