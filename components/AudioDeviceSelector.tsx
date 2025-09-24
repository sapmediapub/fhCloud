import React from 'react';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface AudioDeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}

const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({ devices, selectedDeviceId, onChange, disabled = false }) => {
  if (devices.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4">
      <label htmlFor="audio-source-selector" className="text-xs text-slate-400 mb-2 block">
        Select Microphone
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <MicrophoneIcon className="w-5 h-5" />
        </div>
        <select
            id="audio-source-selector"
            value={selectedDeviceId}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
            {devices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${index + 1}`}
            </option>
            ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        </div>
      </div>
    </div>
  );
};

export default AudioDeviceSelector;
