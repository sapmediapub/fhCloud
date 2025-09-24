import React from 'react';
import FhCloudLogoGraphic from './FhCloudLogoGraphic';

const FhAiLogo: React.FC<{ showSubtitle?: boolean }> = ({ showSubtitle = true }) => (
  <div className="flex flex-col items-center">
    <FhCloudLogoGraphic className="w-32 h-32 mb-4" />
    <h1 className="text-4xl font-bold text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
      FH Cloud
    </h1>
    {showSubtitle && <p className="text-slate-400 mt-1">Audio Detector | Song Match</p>}
  </div>
);

export default FhAiLogo;
