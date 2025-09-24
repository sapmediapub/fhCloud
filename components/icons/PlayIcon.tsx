import React from 'react';

const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M4.018 15.132A1.25 1.25 0 006 14.15V5.85a1.25 1.25 0 00-1.982-1.017L.925 8.983a1.25 1.25 0 000 2.034l3.093 4.115z" />
    </svg>
);

export default PlayIcon;
