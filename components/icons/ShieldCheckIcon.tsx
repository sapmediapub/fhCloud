import React from 'react';

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.611m9 2.611a11.955 11.955 0 01-9-2.611m0 0a11.955 11.955 0 01-2.612-9m2.612 9a11.955 11.955 0 019-2.611" />
  </svg>
);

export default ShieldCheckIcon;