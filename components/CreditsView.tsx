import React from 'react';
import { SongDetails } from '../types';
import XIcon from './icons/XIcon';

interface CreditsViewProps {
  song: SongDetails;
  onClose: () => void;
}

const CreditItem: React.FC<{ label: string; value?: string | string[] }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div>
      <h3 className="text-sm font-bold text-white">{label}</h3>
      <p className="text-base text-slate-300">{displayValue}</p>
    </div>
  );
};

const CreditsView: React.FC<CreditsViewProps> = ({ song, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[#121212] w-full max-w-md rounded-lg shadow-2xl animate-slide-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Credits</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
            aria-label="Close credits"
          >
            <XIcon />
          </button>
        </header>

        <div className="p-6 overflow-y-auto custom-scrollbar-dark space-y-6">
            <h3 className="text-lg font-semibold text-white -mb-2">{song.title}</h3>
            
            <CreditItem label="Performed by" value={song.artist} />
            <CreditItem label="Written by" value={song.writers} />
            <CreditItem label="Produced by" value={song.producers} />
            <CreditItem label="Publisher" value={song.publisher} />
            <CreditItem label="Source" value={song.source} />
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }

        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #121212;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #3e3e3e;
        }
        .custom-scrollbar-dark {
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a #121212;
        }
      `}</style>
    </div>
  );
};

export default CreditsView;
