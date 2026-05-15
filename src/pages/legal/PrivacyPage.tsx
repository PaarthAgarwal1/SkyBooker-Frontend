import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const PrivacyPage: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 11, 2026">
      <section>
        <h2>1. Information We Collect</h2>
        <p>
          At SkyBooker, we collect information that is necessary to provide you with seamless travel booking services. This includes:
        </p>
        <ul>
          <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and passport details.</li>
          <li><strong>Payment Information:</strong> Securely processed via Stripe (we do not store full card numbers).</li>
          <li><strong>Travel Preferences:</strong> Seat selections, meal preferences, and frequent flyer details.</li>
          <li><strong>Usage Data:</strong> IP address, browser type, and interaction with our platform.</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>
          Your data is used primarily to facilitate flight bookings and provide real-time updates. We use it to:
        </p>
        <ul>
          <li>Issue tickets and manage reservations with airlines.</li>
          <li>Send operational alerts (delays, gate changes).</li>
          <li>Personalize your experience and improve our platform.</li>
          <li>Comply with legal and regulatory requirements.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We share your information with third-party service providers only as necessary:
        </p>
        <ul>
          <li><strong>Airlines & Airports:</strong> To fulfill your booking request.</li>
          <li><strong>Payment Processors:</strong> To complete transactions securely.</li>
          <li><strong>Operational Partners:</strong> Weather and flight data providers to deliver alerts.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data, including end-to-end encryption and regular security audits. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, or delete your personal data. You can manage your profile information directly through your account settings or contact us for assistance.
        </p>

        <h2>6. Third-Party Links</h2>
        <p>
          Our platform may contain links to external sites (e.g., airline websites). We are not responsible for the privacy practices of these external sites.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Significant changes will be communicated via email or a prominent notice on our platform.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          For any privacy-related inquiries, please email <strong>privacy@skybooker.com</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPage;
