import React from 'react';

const TermsAndConditions: React.FC = () => {
    return (
        <div className="text-gray-300 space-y-6 text-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Terms & Conditions</h2>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                <p>
                    By accessing or playing Snake Race, you agree to be bound by these Terms and Conditions.
                    If you do not agree with any part of these terms, you must not use our services.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">2. Game Rules & Fair Play</h3>
                <p>
                    Players must compete fairly. The use of bots, scripts, or automated tools to gain an
                    unfair advantage is strictly prohibited. We reserve the right to reset scores or
                    ban accounts that violate this principle.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">3. User Accounts</h3>
                <p>
                    When you sign in with Google, you are responsible for maintaining the security
                    of your account. Your coins, levels, and progress are tied to your unique ID.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">4. Disclaimers</h3>
                <p>
                    Snake Race is provided "as is" without any warranties. As developers, we strive for
                    perfection but are not liable for any data loss, service interruptions, or bugs
                    that may occur during your gameplay.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-2">5. Modifications</h3>
                <p>
                    We reserve the right to modify or discontinue any part of the game at any time.
                    Terms may be updated periodically to reflect changes in the service.
                </p>
            </section>

            <div className="pt-4 text-gray-500 italic">
                Last Updated: January 2026
            </div>
        </div>
    );
};

export default TermsAndConditions;
