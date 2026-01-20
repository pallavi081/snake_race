import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="text-gray-300 space-y-6 text-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">1. Data Collection</h3>
                <p>
                    We collect minimal data to provide you with the best experience. This includes:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Google Account Information (Display name, email, and photo URL)</li>
                    <li>In-game statistics (Scores, coins, levels, and achievements)</li>
                    <li>PWA usage data for performance optimization</li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">2. Data Security</h3>
                <p>
                    Your data is stored securely using Firebase Firestore. We implement strict
                    Security Rules to ensure that only you can modify your personal progress.
                    We use industry-standard encryption for all data transmissions.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">3. Cookies & Storage</h3>
                <p>
                    We use local storage and Firebase session cookies to remember who you are
                    between games. No data is shared with third-party advertisers.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">4. Third-Party Services</h3>
                <p>
                    Our authentication is handled by Google. Please refer to Google's Privacy Policy
                    for details on how they handle your login credentials.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">5. Contact</h3>
                <p>
                    If you have questions about your data or wish to request its deletion,
                    you can reach out through the GitHub project page.
                </p>
            </section>

            <div className="pt-4 text-gray-500 italic">
                Last Updated: January 2026
            </div>
        </div>
    );
};

export default PrivacyPolicy;
