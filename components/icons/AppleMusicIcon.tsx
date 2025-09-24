import React from 'react';

const AppleMusicIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-12.27c.45 0 .88.08 1.29.23.23.08.38.3.38.55v4.97c0 .28-.22.5-.5.5h-.5c-.28 0-.5-.22-.5-.5v-2.07c-1.3-.5-2.17-1.73-2.17-3.18 0-1.87 1.41-3.35 3.17-3.35zm.33 1.61c-.55 0-.91.38-.91.91s.36.91.91.91.91-.38.91-.91-.36-.91-.91-.91z"/>
    </svg>
);

export default AppleMusicIcon;