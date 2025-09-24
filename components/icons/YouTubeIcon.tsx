import React from 'react';

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 13.5v-7l6 3.5-6 3.5z"/>
    </svg>
);

export default YouTubeIcon;