import React from 'react';

const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.75 4.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V4.75zM15.25 4.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V4.75z" />
    </svg>
);

export default PauseIcon;
