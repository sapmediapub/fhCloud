import React from 'react';
import AudioInput from '../AudioInput';
import { AudioData } from '../../types';
import SearchIcon from '../icons/SearchIcon';

interface WebSearchViewProps {
  onSearch: (audioData: AudioData) => void;
}

const WebSearchView: React.FC<WebSearchViewProps> = ({ onSearch }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-teal-300 mb-2 flex items-center justify-center gap-2">
        <SearchIcon className="w-7 h-7" />
        Search Web by Sound
      </h2>
      <p className="text-center text-slate-400 mb-8">Upload or record audio to find information about it online.</p>
      <AudioInput onAudioCaptured={onSearch} />
    </div>
  );
};

export default WebSearchView;