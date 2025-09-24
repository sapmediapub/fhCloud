import React, { useEffect } from 'react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onDismiss }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss]);

  return (
    <div 
      role="alert"
      className="fixed top-5 right-5 z-50 bg-red-600/90 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 animate-slide-in-right"
    >
      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-grow">
        <p className="font-bold">Error</p>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss error message" className="p-1 rounded-full hover:bg-red-500/50">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ErrorToast;
