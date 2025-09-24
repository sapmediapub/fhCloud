import React from 'react';

interface ConfirmationDialogProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ icon, title, message, confirmText, onConfirm, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 w-full max-w-md animate-slide-up text-center">
        {icon && (
          <div className="mx-auto w-16 h-16 bg-purple-900/50 text-purple-400 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <h2 id="dialog-title" className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onCancel}
            className="px-8 py-3 rounded-lg font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
          >
            {confirmText}
          </button>
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
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
