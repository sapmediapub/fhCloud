import React from 'react';

interface StrengthPillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StrengthPillar: React.FC<StrengthPillarProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="w-16 h-16 bg-slate-800/50 border border-slate-700 rounded-full flex items-center justify-center mb-4 text-purple-400">
      {icon}
    </div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400">{description}</p>
  </div>
);

export default StrengthPillar;