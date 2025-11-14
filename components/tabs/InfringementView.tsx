import React, { useState } from 'react';
import AudioInput from '../AudioInput';
import { AudioData } from '../../types';
import CustomAudioPlayer from '../CustomAudioPlayer';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import XIcon from '../icons/XIcon';

interface InfringementViewProps {
  onInfringement: (queryAudio: AudioData, referenceAudio: AudioData) => void;
}

const InfringementView: React.FC<InfringementViewProps> = ({ onInfringement }) => {
  const [queryAudio, setQueryAudio] = useState<AudioData | null>(null);
  const [referenceAudio, setReferenceAudio] = useState<AudioData | null>(null);

  const handleAnalyze = () => {
    if (queryAudio && referenceAudio) {
      onInfringement(queryAudio, referenceAudio);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-purple-400 mb-2">Targeted Infringement Analysis</h2>
      <p className="text-center text-slate-400 mb-6">Compare an audio clip against a reference track. This deep analysis checks for similarities in melody, harmony, and rhythm, ideal for detecting potential infringement or identifying cover songs.</p>
      
      <div className="space-y-6">
        {/* Query Audio Section */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-slate-300 mb-3">1. Audio to Analyze</h3>
          {queryAudio ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Audio clip loaded.</span>
              </div>
              <CustomAudioPlayer src={`data:${queryAudio.mimeType};base64,${queryAudio.data}`} />
              <button onClick={() => setQueryAudio(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded hover:bg-slate-700 transition-colors">
                <XIcon className="w-4 h-4" /> Remove
              </button>
            </div>
          ) : (
            <AudioInput onAudioCaptured={setQueryAudio} />
          )}
        </div>

        {/* Reference Audio Section */}
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-slate-300 mb-3">2. Reference Track</h3>
          {referenceAudio ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Reference track loaded.</span>
              </div>
              <CustomAudioPlayer src={`data:${referenceAudio.mimeType};base64,${referenceAudio.data}`} />
               <button onClick={() => setReferenceAudio(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded hover:bg-slate-700 transition-colors">
                <XIcon className="w-4 h-4" /> Remove
              </button>
            </div>
          ) : (
            <AudioInput onAudioCaptured={setReferenceAudio} />
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleAnalyze}
          disabled={!queryAudio || !referenceAudio}
          className="w-full py-4 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare and Analyze
        </button>
      </div>
    </div>
  );
};

export default InfringementView;