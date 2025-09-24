import React from 'react';

interface AudioInputOptionProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

const AudioInputOption: React.FC<AudioInputOptionProps> = ({ icon, text, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500 hover:bg-slate-800/50 hover:text-white transition-all duration-300 aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-600 disabled:hover:bg-transparent"
    aria-label={text}
    disabled={disabled}
  >
    <div className="w-10 h-10 mb-3">{icon}</div>
    <span className="font-semibold text-sm sm:text-base">{text}</span>
  </button>
);

export default AudioInputOption;