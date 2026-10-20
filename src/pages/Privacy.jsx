import campaignConfig from '../config/campaignConfig.js';
import PageHeader from '../components/PageHeader.jsx';
import { mailtoUrl } from '../services/whatsappService.js';

export default function Privacy() {
  const c = campaignConfig;
  const email = c.contact.email;
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy notice">Last updated {c.privacy.lastUpdated}</PageHeader>
      <section className="section">
        <div className="container narrow prose">
          <p>
            This is an <strong>independent student campaign website</strong> for the {c.candidate.position} election at {c.candidate.university}. It is not
            an official university website. This notice explains how the campaign handles the information you choose to give.
          </p>

          <h2>Who collects your information</h2>
          <p>The campaign of {c.candidate.name} (the "campaign") is responsible for the information collected here. Contact: <a href={mailtoUrl('Privacy request')}>{email}</a>.</p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Registration form:</strong> full name and year of study (required); course, phone number, email address, preferred contact method, areas of interest, how you heard about the campaign and any suggestions (all optional); your consent; the time of submission.</li>
            <li><strong>Feedback form:</strong> your message (required); name, year, topic and a phone number or email (optional).</li>
            <li><strong>Technical fields:</strong> a random request ID used to prevent duplicate saves.</li>
          </ul>
          <p>We do not ask for student registration numbers, ID documents, passwords or other sensitive information. Please do not include such details in free-text boxes. Registration and feedback are <strong>not anonymous</strong> if you give your name or contact details.</p>
          <p>The website does not use advertising trackers or analytics. If you arrive through a link such as <code>?ref=whatsapp</code>, the source is kept in your browser tab only so it can pre-fill the "how did you hear about us" answer.</p>

          <h2>Why we collect it</h2>
          <ul>
            <li>To record your support and understand which priorities matter to Commerce students.</li>
            <li>To contact you about the campaign, only in the way you chose, and only if you gave consent.</li>
            <li>To read and respond to your suggestions and concerns.</li>
          </ul>

          <h2>How it is stored and who can access it</h2>
          <p>
            Submissions are sent to a private Google Sheet owned by the campaign, using Google Apps Script, and a notification email goes to the campaign
            address. Only the campaign owner and people they personally authorise can open the sheet. Your details are never published on this website. Google
            processes the data as the service provider; Google may store it outside Kenya.
          </p>

          <h2>Campaign updates</h2>
          <p>We may use your contact details for campaign updates only where you consented and in the method you selected. You can ask us to stop at any time. A confirmation email is sent only if you tick the optional confirmation box.</p>

          <h2>How long we keep it</h2>
          <p>We keep information {c.privacy.retention}.</p>

          <h2>Your choices and rights</h2>
          <p>
            You may ask to see, correct or delete your information, or withdraw your consent, by emailing{' '}
            <a href={mailtoUrl('Privacy request')}>{email}</a> from the address you used or with enough detail for us to find your entry. We will respond as soon
            as reasonably possible. You may also have rights under Kenya's Data Protection Act, 2019, including the right to complain to the Office of the Data
            Protection Commissioner.
          </p>

          <h2>WhatsApp and email links</h2>
          <p>WhatsApp and email buttons only open your own apps with a pre-written message. Nothing is sent until you press Send. WhatsApp's and your email provider's own privacy terms apply to messages you send.</p>

          <h2>Changes</h2>
          <p>We may update this notice. The date at the top shows the latest version.</p>
        </div>
      </section>
    </>
  );
}
