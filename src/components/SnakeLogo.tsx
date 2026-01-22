import React from 'react';

interface SnakeLogoProps {
    className?: string;
    size?: number;
}

const SnakeLogo: React.FC<SnakeLogoProps> = ({ className, size = 160 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Hex Background Grid (Optional Detail) */}
            <path
                d="M200 40 L234.6 60 L234.6 100 L200 120 L165.4 100 L165.4 60 Z"
                stroke="rgba(59, 130, 246, 0.1)"
                strokeWidth="1"
                fill="none"
            />

            {/* Outer Hexagon Glow */}
            <path
                d="M200 20 L355.8 110 L355.8 290 L200 380 L44.2 290 L44.2 110 Z"
                stroke="url(#bodyGrad)"
                strokeWidth="2"
                strokeOpacity="0.2"
                fill="none"
            />

            {/* The S / Infinity Shape Snake */}
            <g filter="url(#neonGlow)">
                {/* Main Body Path */}
                <path
                    d="M200 120 
             C 280 120, 320 180, 320 240 
             C 320 300, 260 340, 200 340 
             C 140 340, 80 300, 80 240 
             C 80 180, 120 120, 200 120 
             C 280 120, 320 60, 200 60 
             C 80 60, 120 120, 200 120"
                    stroke="url(#bodyGrad)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Inner Purple Gradient Accent */}
                <path
                    d="M200 120 
             C 280 120, 320 180, 320 240 
             C 320 300, 260 340, 200 340 
             C 140 340, 80 300, 80 240 
             C 80 180, 120 120, 200 120"
                    stroke="url(#purpleGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                />

                {/* Snake Head Details */}
                <g transform="translate(200, 60)">
                    {/* Head Shape */}
                    <path
                        d="M-15 -10 L15 -10 L25 5 L0 15 L-25 5 Z"
                        fill="url(#bodyGrad)"
                    />
                    {/* Eyes */}
                    <circle cx="-8" cy="-2" r="2.5" fill="white" />
                    <circle cx="8" cy="-2" r="2.5" fill="white" />
                    {/* Tongue */}
                    <path d="M0 15 L0 25 M-3 25 L0 20 L3 25" stroke="#ef4444" strokeWidth="2" fill="none" />
                </g>
            </g>

            {/* Tech/Circuit Lines */}
            <g opacity="0.4" stroke="url(#bodyGrad)" strokeWidth="1.5">
                <path d="M300 100 L340 60 L360 60" />
                <path d="M100 300 L60 340 L40 340" />
                <path d="M320 280 L350 310" />
                <circle cx="360" cy="60" r="3" fill="url(#bodyGrad)" />
                <circle cx="40" cy="340" r="3" fill="url(#bodyGrad)" />
            </g>
        </svg>
    );
};

export default SnakeLogo;
