import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ActivityLogEntry, AudioData, SongDetails, UsageResult } from '../../types';
import { identifySong, findSongUsage } from '../../services/geminiService';
import { identifySongWithAcrCloud } from '../../services/acrcloudService';
import { acrCloudCredentials } from '../AcrCloudProjectInfo';
import ConfirmationDialog from '../ConfirmationDialog';
import BroadcastIcon from '../icons/BroadcastIcon';
import LiveIndicator from '../LiveIndicator';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import FindUsageIcon from '../icons/FindUsageIcon';
import { useAudioDevices } from '../../hooks/useAudioDevices';
import AudioDeviceSelector from '../AudioDeviceSelector';
import CustomAudioPlayer from '../CustomAudioPlayer';
import SpotifyIcon from '../icons/SpotifyIcon';
import AppleMusicIcon from '../icons/AppleMusicIcon';
import YouTubeIcon from '../icons/YouTubeIcon';
import MusicIcon from '../icons/MusicIcon';

const MonitoringView: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [usageResult, setUsageResult] = useState<UsageResult | null>(null);
  const [isFindingUsage, setIsFindingUsage] = useState(false);

  const { audioDevices, selectedDeviceId, setSelectedDeviceId, refreshDevices } = useAudioDevices();

  const handleSelectEntry = (entry: ActivityLogEntry) => {
      setSelectedEntry(entry);
      setUsageResult(null);
      setIsFindingUsage(false);
  }

  const handleBlobToBase64 = (blob: Blob): Promise<AudioData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ mimeType: blob.type, data: base64String });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size === 0) return;
    let result: SongDetails;
    try {
      const audioData = await handleBlobToBase64(audioBlob);
      
      // Step 1: Identify with ACRCloud
      const acrResult = await identifySongWithAcrCloud(audioData, acrCloudCredentials);

      // Step 2: If match, enrich with Gemini
      if (acrResult.match && acrResult.title && acrResult.artist) {
          const enrichedResult = await identifySong(audioData, {
              title: acrResult.title,
              artist: acrResult.artist,
              album: acrResult.album || '',
          });
          result = {
              ...enrichedResult,
              ...acrResult,
              match: true,
          };
      } else {
        result = acrResult as SongDetails;
      }
      
      const newEntry: ActivityLogEntry = {
        id: new Date().toISOString(),
        timestamp: new Date(),
        audioClip: audioData,
        result: result,
      };
      
      setActivityLog(prevLog => [newEntry, ...prevLog]);
    } catch (error) {
      console.error("Error identifying song during monitoring:", error);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsMonitoring(false);
  }, []);
  
  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return;

    try {
      // 1. Request the media stream using the currently selected device ID.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
        }
      });
      
      // 2. After permissions are granted, refresh the device list to get accurate labels.
      await refreshDevices();
      
      setAudioStream(stream);
      setIsMonitoring(true);
      setActivityLog([]);
      setSelectedEntry(null);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
           processAudioChunk(event.data);
        }
      };
      
      recorder.onstop = () => {
         stream.getTracks().forEach(track => track.stop());
         setAudioStream(null);
      };

      recorder.start(10000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
      setIsMonitoring(false);
    }
  }, [isMonitoring, selectedDeviceId, refreshDevices, processAudioChunk]);


  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      setShowConfirmation(true);
    }
  };
  
  const handleFindUsage = async () => {
      if (!selectedEntry || !selectedEntry.result.match || !selectedEntry.result.title || !selectedEntry.result.artist) return;
      setIsFindingUsage(true);
      setUsageResult(null);
      try {
          const usage = await findSongUsage(selectedEntry.result.title, selectedEntry.result.artist);
          setUsageResult(usage);
      } catch (error) {
          console.error("Failed to find usage", error);
      } finally {
          setIsFindingUsage(false);
      }
  }

  const handleConfirmStart = () => {
    setShowConfirmation(false);
    startMonitoring();
  };

  const handleCancelStart = () => {
    setShowConfirmation(false);
  };

  const selectedDevice = audioDevices.find(d => d.deviceId === selectedDeviceId);
  
  const getDspInfo = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('spotify.com')) {
        return { name: 'Spotify', icon: <SpotifyIcon /> };
    }
    if (lowerUrl.includes('music.apple.com')) {
        return { name: 'Apple Music', icon: <AppleMusicIcon /> };
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return { name: 'YouTube', icon: <YouTubeIcon /> };
    }
    return { name: 'Listen', icon: <MusicIcon /> };
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  
  const youtubeUrl = usageResult?.sources.map(s => getYouTubeEmbedUrl(s.web.uri)).find(url => url !== null);
  const otherDspLinks = usageResult?.sources.filter(s => !getYouTubeEmbedUrl(s.web.uri));

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-blue-300 mb-2">Live Broadcast Monitoring</h2>
      <p className="text-center text-slate-400 mb-6">Continuously analyzing audio stream in 10-second intervals.</p>
      
      {audioDevices.length > 1 && (
        isMonitoring ? (
          <div className="mb-4">
            <label htmlFor="audio-source-display" className="text-xs text-slate-400 mb-2 block">
              Monitoring with Microphone
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <BroadcastIcon className="w-5 h-5" />
              </div>
              <div
                id="audio-source-display"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-300 truncate"
              >
                {selectedDevice?.label || `Default Device`}
              </div>
            </div>
          </div>
        ) : (
          <AudioDeviceSelector 
            devices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            onChange={setSelectedDeviceId}
          />
        )
      )}
      
      <button
        onClick={handleToggleMonitoring}
        className="w-full py-4 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
      >
        <BroadcastIcon className="w-6 h-6" />
        {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
      </button>

      {isMonitoring && (
        <div className="my-6 flex items-center justify-center gap-3 animate-fade-in p-3 bg-slate-900/50 rounded-lg border border-slate-700">
           <LiveIndicator stream={audioStream} />
           <p className="text-sm font-semibold text-red-400 animate-pulse tracking-wider">LIVE</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 h-[600px]">
        {/* Activity Log */}
        <div className="bg-slate-900/50 rounded-lg p-1 border border-slate-700 flex flex-col">
          <h3 className="font-semibold text-slate-300 mb-2 flex-shrink-0 p-3">Activity Log</h3>
          <div className="flex-grow text-slate-400 text-sm overflow-y-auto custom-scrollbar px-3 pb-2">
            {activityLog.length > 0 ? (
              <ul>
                {activityLog.map(entry => (
                  <li key={entry.id}>
                    <button 
                      onClick={() => handleSelectEntry(entry)} 
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors border-l-4 ${
                        selectedEntry?.id === entry.id
                        ? 'bg-purple-600/30 border-purple-500'
                        : entry.result.match
                        ? 'bg-slate-800 border-green-500 hover:bg-slate-700/50'
                        : 'bg-slate-800 border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-slate-400">{entry.timestamp.toLocaleTimeString()}</p>
                        {entry.result.match ? (
                            <span className="text-xs font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Match Found</span>
                        ) : (
                            <span className="text-xs font-semibold bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">No Match</span>
                        )}
                      </div>
                      <p className="font-semibold text-white truncate">{entry.result.match ? entry.result.title : 'Unknown'}</p>
                      <p className="text-sm text-slate-300 truncate">{entry.result.match ? entry.result.artist : 'Unknown'}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center text-center h-full p-2">
                {isMonitoring ? 'Listening for audio...' : 'Start monitoring to see results.'}
              </div>
            )}
          </div>
        </div>
        {/* Selection Details */}
        <div className="bg-slate-900/50 rounded-lg p-1 border border-slate-700 flex flex-col">
          <h3 className="font-semibold text-slate-300 mb-2 flex-shrink-0 p-3">Selection Details</h3>
          <div className="flex-grow text-slate-400 text-sm p-3 overflow-y-auto custom-scrollbar">
            {selectedEntry ? (
              <div className="text-left w-full space-y-4">
                {selectedEntry.result.match ? (
                   <>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-white truncate">{selectedEntry.result.title}</h4>
                        <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                      </div>
                      <p className="text-slate-300">{selectedEntry.result.artist}</p>
                      <p className="text-xs text-slate-400">Album: {selectedEntry.result.album || 'N/A'}</p>
                    </div>

                    <hr className="border-slate-700" />
                    
                    <div>
                      <h5 className="text-sm font-semibold text-slate-300 mb-2">Captured 10s Clip</h5>
                       <CustomAudioPlayer src={`data:${selectedEntry.audioClip.mimeType};base64,${selectedEntry.audioClip.data}`} />
                    </div>

                    <hr className="border-slate-700" />
                    
                    <button 
                      onClick={handleFindUsage}
                      disabled={isFindingUsage}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <FindUsageIcon />
                      Find on DSPs
                   </button>

                    {isFindingUsage && <p className="text-center text-slate-400">Searching...</p>}
                    
                    {usageResult && (
                      <div className="space-y-3 pt-2 animate-fade-in">
                        {youtubeUrl && (
                          <div>
                            <h5 className="text-sm font-semibold text-slate-300 mb-2">Video Preview</h5>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <iframe
                                src={youtubeUrl}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              ></iframe>
                            </div>
                          </div>
                        )}
                        <h5 className="text-sm font-semibold text-slate-300">Listen on Digital Platforms</h5>
                        {otherDspLinks && otherDspLinks.length > 0 ? (
                            <ul className="space-y-2">
                                {otherDspLinks.map((source, i) => {
                                    const dsp = getDspInfo(source.web.uri);
                                    return (
                                    <li key={i}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700/70 transition-colors">
                                        <div className="w-6 h-6 flex-shrink-0 text-slate-300">{dsp.icon}</div>
                                        <span className="font-semibold text-slate-200 text-sm">{dsp.name}</span>
                                        </a>
                                    </li>
                                    );
                                })}
                            </ul>
                        ) : !youtubeUrl ? (
                            <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">{usageResult.summary || "Could not find links on major streaming platforms."}</p>
                        ) : null}
                      </div>
                    )}
                   </>
                ) : (
                  <div className="flex items-center justify-center text-center h-full p-2">
                    <p>{selectedEntry.result.reasoning || 'Could not identify the audio clip.'}</p>
                  </div>
                )}
              </div>
            ) : <div className="flex items-center justify-center text-center h-full p-2">'Select an entry from the log to view details.'</div>}
          </div>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationDialog
          icon={<BroadcastIcon className="w-8 h-8" />}
          title="Start Live Monitoring?"
          message="This will continuously use your microphone to analyze the audio stream in 10-second intervals to identify songs. Are you sure you want to proceed?"
          confirmText="Start Monitoring"
          onConfirm={handleConfirmStart}
          onCancel={handleCancelStart}
        />
      )}
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
          border: 2px solid #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #475569 transparent;
        }
      `}</style>
    </div>
  );
};

export default MonitoringView;