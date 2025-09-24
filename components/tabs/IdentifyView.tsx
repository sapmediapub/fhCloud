import React from 'react';
import AudioInput from '../AudioInput';
import { AudioData, AcrCredentials } from '../../types';
import { acrCloudCredentials } from '../AcrCloudProjectInfo';

interface IdentifyViewProps {
  onIdentify: (audioData: AudioData, acrCredentials: AcrCredentials) => void;
}

const IdentifyView: React.FC<IdentifyViewProps> = ({ onIdentify }) => {

  const handleAudioCaptured = (audioData: AudioData) => {
    onIdentify(audioData, acrCloudCredentials);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-blue-300 mb-2">High-Accuracy Recognition</h2>
      <p className="text-center text-slate-400 mb-6">Utilizes industry-leading fingerprinting that works even on remixes and alterations, backed by a huge catalog of licensed tracks.</p>
      
      <AudioInput onAudioCaptured={handleAudioCaptured} />
    </div>
  );
};

export default IdentifyView;