import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const CookiePage: React.FC = () => {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="May 11, 2026">
      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
        </p>

        <h2>2. How We Use Cookies</h2>
        <p>
          SkyBooker uses cookies to improve your browsing experience and for the following purposes:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Necessary for the operation of our platform (e.g., login, session management).</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences, such as language or recent searches.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site to improve performance.</li>
          <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track their effectiveness.</li>
        </ul>

        <h2>3. Types of Cookies We Use</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Session</td>
              <td>Temporary login state</td>
              <td>End of session</td>
            </tr>
            <tr>
              <td>Preferences</td>
              <td>Currency and language</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Traffic measurement</td>
              <td>2 years</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Managing Your Cookies</h2>
        <p>
          Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but this may affect your ability to use certain features of the SkyBooker platform.
        </p>

        <h2>5. Consent</h2>
        <p>
          By continuing to use SkyBooker, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by modifying your browser settings.
        </p>

        <h2>6. Third-Party Cookies</h2>
        <p>
          Some cookies may be placed by third-party services that appear on our pages (e.g., Google Maps, Stripe). We do not have direct control over these cookies.
        </p>

        <h2>7. More Information</h2>
        <p>
          For further information about how we use your data, please refer to our <strong>Privacy Policy</strong>.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have questions about our cookie usage, contact us at <strong>compliance@skybooker.com</strong>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiePage;
