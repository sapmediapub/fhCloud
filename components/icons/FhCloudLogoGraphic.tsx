import React from 'react';

const FhCloudLogoGraphic: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 150 150" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="waveFGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style={{ stopColor: '#67e8f9' }} />
        <stop offset="100%" style={{ stopColor: '#06b6d4' }} />
      </linearGradient>
       <linearGradient id="waveHGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style={{ stopColor: '#f472b6' }} />
        <stop offset="100%" style={{ stopColor: '#c026d3' }} />
      </linearGradient>
    </defs>
    
    <circle cx="75" cy="75" r="70" fill="url(#circleGradient)" opacity="0.5" />
    <circle cx="75" cy="75" r="65" fill="#0d1121" />

    {/* Circuit board paths */}
    <path d="M75 10 V 25 M75 140 V 125 M10 75 H 25 M140 75 H 125" stroke="#22d3ee" strokeWidth="0.5" opacity="0.4" />
    <path d="M35 35 L 50 50 M115 35 L 100 50 M35 115 L 50 100 M115 115 L 100 100" stroke="#22d3ee" strokeWidth="0.5" opacity="0.4" />
    <path d="M50 20 H 100 M20 50 V 100 M130 50 V 100 M50 130 H 100" stroke="#a855f7" strokeWidth="0.5" opacity="0.4" />
    
    {/* Cloud outline */}
    <path 
      d="M55,95 A20,20 0 0,0 35,75 A15,15 0 0,0 50,60 A25,25 0 0,0 100,60 A15,15 0 0,0 115,75 A20,20 0 0,0 95,95 Z" 
      fill="none" 
      stroke="#FFFFFF" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />

    {/* FH Letters outline */}
    <path d="M60 70 V 90 H 70 V 80 H 78 V 70 H 60 Z" fill="#FFFFFF" />
    <path d="M82 70 V 90 H 90 V 80 H 98 V 90 H 106 V 70 H 98 V 79 H 90 V 70 H 82 Z" fill="#FFFFFF" />
    
    {/* Waveforms inside FH */}
    {/* F Wave */}
    <g clipPath="url(#clipF)">
      <path d="M62 80 C 64 75, 66 75, 68 80 S 72 85, 74 80" stroke="url(#waveFGradient)" strokeWidth="2" fill="none" />
    </g>
    <defs>
      <clipPath id="clipF">
        <path d="M60 70 V 90 H 70 V 80 H 78 V 70 H 60 Z" />
      </clipPath>
    </defs>

    {/* H Wave */}
    <g clipPath="url(#clipH)">
      <path d="M84 80 C 86 75, 88 75, 90 80 S 94 85, 96 80 S 100 75, 102 80" stroke="url(#waveHGradient)" strokeWidth="2" fill="none" />
    </g>
    <defs>
      <clipPath id="clipH">
        <path d="M82 70 V 90 H 90 V 80 H 98 V 90 H 106 V 70 H 98 V 79 H 90 V 70 H 82 Z" />
      </clipPath>
    </defs>

    {/* Circuit dots */}
    <circle cx="75" cy="25" r="1.5" fill="#a855f7" opacity="0.6" />
    <circle cx="75" cy="125" r="1.5" fill="#a855f7" opacity="0.6" />
    <circle cx="25" cy="75" r="1.5" fill="#a855f7" opacity="0.6" />
    <circle cx="125" cy="75" r="1.5" fill="#a855f7" opacity="0.6" />
    <circle cx="50" cy="50" r="1.5" fill="#22d3ee" opacity="0.6" />
    <circle cx="100" cy="50" r="1.5" fill="#22d3ee" opacity="0.6" />
    <circle cx="50" cy="100" r="1.5" fill="#22d3ee" opacity="0.6" />
    <circle cx="100" cy="100" r="1.5" fill="#22d3ee" opacity="0.6" />

  </svg>
);

export default FhCloudLogoGraphic;
