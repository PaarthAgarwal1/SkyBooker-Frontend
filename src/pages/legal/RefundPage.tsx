import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const RefundPage: React.FC = () => {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="May 11, 2026">
      <section>
        <h2>1. General Principles</h2>
        <p>
          SkyBooker follows the refund policies established by each individual airline. We aim to process refund requests as quickly as possible, but timelines are largely dependent on the airline's internal procedures.
        </p>

        <h2>2. Refund Eligibility</h2>
        <p>
          Refunds are typically available under the following conditions:
        </p>
        <ul>
          <li><strong>Flight Cancellation:</strong> If the airline cancels your flight and does not provide an acceptable alternative.</li>
          <li><strong>Refundable Fares:</strong> If you purchased a ticket with a "Refundable" fare class.</li>
          <li><strong>Significant Schedule Changes:</strong> If the airline makes a significant change to your departure or arrival time.</li>
          <li><strong>Regulatory Mandates:</strong> Refunds required by government regulations (e.g., US DOT or Indian DGCA rules).</li>
        </ul>

        <h2>3. Non-Refundable Items</h2>
        <p>
          Unless otherwise stated, the following items are usually non-refundable:
        </p>
        <ul>
          <li>SkyBooker Service Fees.</li>
          <li>Credit card processing fees.</li>
          <li>Add-on services already utilized (e.g., lounge access, special meals).</li>
          <li>Promotional or non-refundable fare types.</li>
        </ul>

        <h2>4. Refund Process</h2>
        <p>
          To request a refund, you must initiate the process through your "My Bookings" dashboard or contact our support team. Once the request is validated:
        </p>
        <ol>
          <li>We submit the request to the respective airline.</li>
          <li>The airline reviews and approves the refund amount.</li>
          <li>Funds are returned to the original payment method.</li>
        </ol>

        <h2>5. Processing Time</h2>
        <p>
          Most refunds are processed within 7 to 15 business days after approval. However, some international transactions or specific airline policies may extend this period to 30-45 days.
        </p>

        <h2>6. Force Majeure</h2>
        <p>
          In cases of extreme circumstances (natural disasters, global pandemics), airlines may issue travel vouchers or credits instead of cash refunds. SkyBooker will advocate for your preferred outcome but must adhere to the airline's final decision.
        </p>

        <h2>7. Contact</h2>
        <p>
          For refund status updates, please email <strong>refunds@skybooker.com</strong> with your PNR number in the subject line.
        </p>
      </section>
    </LegalLayout>
  );
};

export default RefundPage;
