import React, { useState, useRef, useEffect } from 'react';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';

interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);
  
  // When the src changes, reset the player state
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const progressBarBackground = `linear-gradient(to right, #a855f7 ${
    (currentTime / duration) * 100
  }%, #475569 ${(currentTime / duration) * 100}%)`;

  return (
    <div className="bg-slate-800/70 p-2 rounded-lg flex items-center gap-3 border border-slate-700">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlayPause} 
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="text-xs text-slate-400 font-mono w-10 text-center">{formatTime(currentTime)}</span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1.5 bg-slate-600 rounded-full appearance-none cursor-pointer custom-slider"
        style={{ background: progressBarBackground }}
      />
      <span className="text-xs text-slate-400 font-mono w-10 text-center">{formatTime(duration)}</span>
      <style>{`
        .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            background: #e5e7eb; /* gray-200 */
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s;
        }
        .custom-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            background: #e5e7eb; /* gray-200 */
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        .custom-slider:hover::-webkit-slider-thumb {
            background: #fff;
        }
        .custom-slider:hover::-moz-range-thumb {
            background: #fff;
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;
