import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const TermsPage: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 11, 2026">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the SkyBooker platform ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. SkyBooker provides a flight discovery and booking management platform.
        </p>

        <h2>2. User Responsibilities</h2>
        <p>
          As a user of SkyBooker, you represent that you are of legal age to form a binding contract. You are responsible for:
        </p>
        <ul>
          <li>Maintaining the confidentiality of your account and password.</li>
          <li>Providing accurate and complete information during the booking process.</li>
          <li>Complying with all airline-specific rules and international travel regulations.</li>
          <li>Ensuring you have the necessary travel documents (passports, visas, etc.) for your journey.</li>
        </ul>

        <h2>3. Booking and Payments</h2>
        <p>
          All bookings made through SkyBooker are subject to availability. Prices displayed are in Indian Rupee (INR) and include applicable taxes unless otherwise stated. Payments are processed securely via Stripe. By providing a payment method, you authorize us to charge the total booking amount.
        </p>

        <h2>4. Cancellations and Refunds</h2>
        <p>
          Cancellation policies vary by airline and fare type. Users must review specific fare rules before booking. SkyBooker may charge a service fee for processing cancellations or modifications in addition to any airline-imposed penalties.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          The content, layout, design, and software of the SkyBooker platform are the intellectual property of SkyBooker and are protected by copyright and other intellectual property laws.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          SkyBooker acts as an intermediary between you and the airlines. We are not liable for flight delays, cancellations, or any damages arising from the airline's performance or failure to perform.
        </p>

        <h2>7. Governing Law</h2>
        <p>
          These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
        </p>

        <h2>8. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at <strong>legal@skybooker.com</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsPage;
