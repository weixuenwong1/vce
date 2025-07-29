import React from 'react';
import '../styles/Legal.scss';

const PrivacyPolicy = () => (
    <div className="privacy-policy" style={{ padding: '2rem' }}>
        <div className="privacy-policy-container">
        <h1>Privacy Policy</h1>
        <p>Chuba.io ("Chuba," "we," or "us") is committed to safeguarding your privacy. This Privacy Policy describes how we collect, use, protect, and store the information you provide when using our educational platform, which offers summaries of VCE topics, ideas, and practice questions with solutions. If you have questions or concerns about this policy, please contact us.</p>

        <p>By accessing or using Chuba.io, you agree to the collection and use of your information in accordance with this Privacy Policy.</p>

        <h2>1. Applicable Law</h2>
        <p>Chuba.io operates under Australian data protection laws. By using our platform, you consent to the processing and storage of your information in Australia in compliance with applicable Australian laws.</p>

        <h2>2. Information We Collect</h2>
        <h3>Information you submit:</h3>
        <ul>
            <li>Email address</li>
            <li>School name</li>
            <li>Password (securely encrypted)</li>
        </ul>

        <h3>Automatically Collected Information:</h3>
        <ul>
            <li>Cookies for authentication and session management.</li>
            <li>IP addresses, as part of standard web server logs.</li>
        </ul>

        <h2>4. Purpose of Data Collection</h2>
        <ul>
            <li>Providing access to educational resources.</li>
            <li>Account authentication and security.</li>
            <li>Internal analytics, specifically tracking school participation rates.</li>
        </ul>

        <h2>5. Cookies</h2>
        <p>Chuba.io uses essential cookies for authentication and session continuity. You can manage cookies through your browser settings; however, disabling essential cookies may prevent full use of our services.</p>

        <h2>6. Data Storage and Security</h2>
        <p>All user data is stored securely on our PostgreSQL database hosted within Australia. We employ stringent security measures to prevent unauthorized access, alteration, disclosure, or destruction of your personal data.</p>

        <h2>7. Third-Party Sharing</h2>
        <p>Chuba.io does not share your personal information with third parties.</p>

        <h2>8. Your Rights</h2>
        <ul>
            <li>Access your personal data.</li>
            <li>Update or correct your personal information.</li>
            <li>Request deletion of your account and related data.</li>
        </ul>

        <h2>9. Children’s Privacy</h2>
        <p>Chuba.io complies with relevant child protection laws. We do not intentionally collect or solicit data from children under the age of 13. If we become aware of such collection, we will promptly delete the information.</p>

        <h2>10.Policy Updates</h2>
        <p>We may update this Privacy Policy periodically. Any changes will be clearly communicated via our website.</p>

        <h2>11. Contact Us</h2>
        <p>If you have any questions regarding this Privacy Policy, please contact us at: chubabusiness@gmail.com.</p>
    </div>
</div>
)

export default PrivacyPolicy;