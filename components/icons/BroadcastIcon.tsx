import React from 'react';

const BroadcastIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 15C10.211 16.42 12 17.25 12 17.25s1.789-.83 3.375-2.25M6 12C8.31 14.653 12 16.5 12 16.5s3.69-1.847 6-4.5M3.375 9C6.44 12.88 12 15.75 12 15.75s5.56-2.87 8.625-6.75" />
    </svg>
);

export default BroadcastIcon;
