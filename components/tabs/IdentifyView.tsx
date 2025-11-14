import React, { useState } from 'react';
import AudioInput from '../AudioInput';
import { AudioData, AcrCredentials } from '../../types';
import { acrCloudCredentials } from '../AcrCloudProjectInfo';

interface IdentifyViewProps {
  onIdentify: (audioData: AudioData, acrCredentials: AcrCredentials, options: { type: 'fingerprint' | 'music' | 'speech', includeCovers?: boolean }) => void;
}

const IdentifyView: React.FC<IdentifyViewProps> = ({ onIdentify }) => {
  const [detectionType, setDetectionType] = useState<'fingerprint' | 'music' | 'speech'>('fingerprint');
  const [includeCovers, setIncludeCovers] = useState(false);

  const handleAudioCaptured = (audioData: AudioData) => {
    onIdentify(audioData, acrCloudCredentials, {
      type: detectionType,
      includeCovers: detectionType === 'music' ? includeCovers : false,
    });
  };

  const getHeaderText = () => {
    switch (detectionType) {
      case 'fingerprint': return 'Audio Fingerprinting';
      case 'music': return 'Comprehensive Music Recognition';
      case 'speech': return 'Speech-to-Text Transcription';
      default: return '';
    }
  };

  const getDescriptionText = () => {
    switch (detectionType) {
      case 'fingerprint': return 'Utilizes industry-leading fingerprinting to detect the exact version of a song.';
      case 'music': return 'Detects original songs, covers, remixes, and live versions via deep audio analysis.';
      case 'speech': return 'Transcribe spoken words from an audio clip into text.';
      default: return '';
    }
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        {/* Detection Type Selector */}
        <div>
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button 
              onClick={() => setDetectionType('fingerprint')} 
              className={`w-full py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-300 ${detectionType === 'fingerprint' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Fingerprinting
            </button>
            <button 
              onClick={() => setDetectionType('music')} 
              className={`w-full py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-300 ${detectionType === 'music' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Music Recognition
            </button>
            <button 
              onClick={() => setDetectionType('speech')} 
              className={`w-full py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-300 ${detectionType === 'speech' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Speech-to-Text
            </button>
          </div>
        </div>
        
        {/* Cover Song Toggle - only for music */}
        {detectionType === 'music' && (
          <div 
            className="flex items-center justify-center gap-2 animate-fade-in" 
            style={{animationDelay: '100ms'}}
          >
            <input
              type="checkbox"
              id="include-covers"
              checked={includeCovers}
              onChange={(e) => setIncludeCovers(e.target.checked)}
              className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <label htmlFor="include-covers" className="text-sm text-slate-300 cursor-pointer select-none">
              Include cover songs & remixes
            </label>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-center text-blue-300 mb-2">
        {getHeaderText()}
      </h2>
      <p className="text-center text-slate-400 mb-6 min-h-[40px]">
        {getDescriptionText()}
      </p>
      
      <AudioInput onAudioCaptured={handleAudioCaptured} />

      <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default IdentifyView;