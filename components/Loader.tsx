import React from 'react';

interface LoaderProps {
  operation: 'identify' | 'infringe' | 'usage' | null;
}

const Loader: React.FC<LoaderProps> = ({ operation }) => {
  const messages = {
    identify: 'Identifying song...',
    infringe: 'Analyzing for infringement...',
    usage: 'Searching for online usage...',
  };
  const text = operation ? messages[operation] : 'Processing...';

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16 animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute inset-2 border-4 border-slate-600 rounded-full animate-pulse"></div>
      </div>
      <p className="text-purple-400 text-lg font-semibold animate-pulse">{text}</p>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Loader;
