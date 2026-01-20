import React from 'react';
import { Shield, Sparkles, Smartphone, Code } from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="text-gray-300 space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">About Snake Race</h2>
                <p className="text-blue-400">Pioneering Secure & Fun Web Gaming</p>
            </div>

            <section>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
                    <Code className="text-purple-400" size={20} /> My Vision
                </h3>
                <p className="leading-relaxed">
                    I am a developer dedicated to delivering the best, most secure website experience.
                    My vision for **Snake Race** is to create a platform where performance meets security.
                    I believe that web games should be fast, fair, and accessible to everyone, without compromising on data integrity.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <Shield className="text-green-400 mb-2" size={24} />
                    <h4 className="font-bold text-white mb-1">Secure by Design</h4>
                    <p className="text-xs">
                        Using Firebase's robust security rules and encrypted communication to keep your stats safe.
                    </p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <Smartphone className="text-blue-400 mb-2" size={24} />
                    <h4 className="font-bold text-white mb-1">PWA Ready</h4>
                    <p className="text-xs">
                        A compact, mobile-optimized experience that works offline and installs like a real app.
                    </p>
                </div>
            </div>

            <section>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
                    <Sparkles className="text-yellow-400" size={20} /> The Journey
                </h3>
                <p className="leading-relaxed">
                    This project started as a tribute to the classic snake game, but evolved into a full-featured
                    multiplayer arena. Every line of code is written with attention to detail, ensuring that
                    the game feels responsive on both high-end desktops and compact mobile devices.
                </p>
            </section>

            <div className="pt-6 border-t border-gray-700 text-center">
                <p className="text-sm italic">
                    "Best secure website experience, delivered one segment at a time."
                </p>
                <div className="mt-4 font-bold text-white">- Pallavi Kumari, Developer</div>
            </div>
        </div>
    );
};

export default AboutUs;
