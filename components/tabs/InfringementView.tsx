import React from 'react';
import AudioInput from '../AudioInput';
import { AudioData, AcrCredentials } from '../../types';
import { acrCloudCredentials } from '../AcrCloudProjectInfo';

interface InfringementViewProps {
  onInfringement: (audioData: AudioData, acrCredentials: AcrCredentials) => void;
}

const InfringementView: React.FC<InfringementViewProps> = ({ onInfringement }) => {

  const handleAudioCaptured = (audioData: AudioData) => {
    // Analysis starts immediately upon capturing audio using the high-accuracy workflow.
    onInfringement(audioData, acrCloudCredentials);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-purple-400 mb-2">Automated Enforcement</h2>
      <p className="text-center text-slate-400 mb-6">Analyze audio against our vast catalog to identify usage, manage rights, and route royalties through our attribution marketplace.</p>
      
      <AudioInput onAudioCaptured={handleAudioCaptured} />
    </div>
  );
};

export default InfringementView;