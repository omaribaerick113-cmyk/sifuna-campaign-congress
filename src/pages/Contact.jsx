import PageHeader from '../components/PageHeader.jsx';
import ContactSection from '../components/ContactSection.jsx';

export default function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to the campaign">
        Email or WhatsApp - whichever is easier for you.
      </PageHeader>
      <section className="section">
        <div className="container">
          <ContactSection />
          <p className="fine-print center-text">
            WhatsApp opens a chat with a ready-made message. You need to press Send in WhatsApp for the campaign to receive it.
          </p>
        </div>
      </section>
    </>
  );
}
