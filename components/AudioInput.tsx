import React, { useState, useRef, useEffect } from 'react';
import AudioInputOption from './AudioInputOption';
import MicrophoneIcon from './icons/MicrophoneIcon';
import UploadIcon from './icons/UploadIcon';
import { AudioData } from '../types';
import AudioVisualizer from './AudioVisualizer';
import { useAudioDevices } from '../hooks/useAudioDevices';
import AudioDeviceSelector from './AudioDeviceSelector';

interface AudioInputProps {
  onAudioCaptured: (audioData: AudioData) => void;
}

// Helper function to encode AudioBuffer to WAV blob
const bufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };

  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  const channels = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([view], { type: 'audio/wav' });
};

const AudioInput: React.FC<AudioInputProps> = ({ onAudioCaptured }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { audioDevices, selectedDeviceId, setSelectedDeviceId, refreshDevices } = useAudioDevices();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

      let bufferToProcess = decodedBuffer;
      
      // If the audio is longer than 10 seconds, trim it.
      if (decodedBuffer.duration > 10) {
        const sampleRate = decodedBuffer.sampleRate;
        const tenSecondsSamples = sampleRate * 10;
        const numberOfChannels = decodedBuffer.numberOfChannels;
        
        const trimmedBuffer = audioContext.createBuffer(
          numberOfChannels,
          tenSecondsSamples,
          sampleRate
        );

        for (let i = 0; i < numberOfChannels; i++) {
          const channelData = decodedBuffer.getChannelData(i);
          const trimmedData = trimmedBuffer.getChannelData(i);
          trimmedData.set(channelData.subarray(0, tenSecondsSamples));
        }
        bufferToProcess = trimmedBuffer;
      }
      
      // Re-encode the (potentially trimmed) audio to WAV for standardization.
      const wavBlob = bufferToWav(bufferToProcess);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onAudioCaptured({ mimeType: 'audio/wav', data: base64String });
      };
      reader.readAsDataURL(wavBlob);

    } catch (error) {
      console.error("Error processing audio file:", error);
      alert("Failed to process the audio file. It might be corrupted or in an unsupported format.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessingFile(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
     if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsRecording(false);
    setCountdown(10);
    audioStream?.getTracks().forEach(track => track.stop());
    setAudioStream(null);
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined
        }
      });
      await refreshDevices(); // After permission, labels are available. Refresh device list.
      setAudioStream(stream);
      setIsRecording(true);
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            onAudioCaptured({ mimeType: audioBlob.type, data: base64String });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };

      recorder.start();
      
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      setTimeout(() => {
        stopRecording();
      }, 10000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };
  
  useEffect(() => {
      if (countdown <= 0 && isRecording) {
          stopRecording();
      }
      return () => {
          if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
          }
      }
  }, [countdown, isRecording]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  if (isRecording) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-500 rounded-lg bg-slate-800/50 transition-all duration-300 min-h-[160px]">
        <h3 className="text-lg font-semibold text-white mb-2">Recording...</h3>
        <div className="text-4xl font-bold text-purple-400 mb-4">{countdown}</div>
        <AudioVisualizer stream={audioStream} />
        <button onClick={stopRecording} className="mt-4 text-sm text-slate-400 hover:text-white">Cancel</button>
      </div>
    );
  }

  return (
    <>
      <AudioDeviceSelector
        devices={audioDevices}
        selectedDeviceId={selectedDeviceId}
        onChange={setSelectedDeviceId}
        disabled={isProcessingFile}
      />
      <div className="grid grid-cols-2 gap-4">
        <input type="file" id="audio-upload" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="audio/*"/>
        <AudioInputOption icon={<UploadIcon />} text={isProcessingFile ? "Processing..." : "Upload File"} onClick={handleUploadClick} disabled={isProcessingFile} />
        <AudioInputOption icon={<MicrophoneIcon />} text="Record Audio" onClick={startRecording} disabled={isProcessingFile} />
      </div>
    </>
  );
};

export default AudioInput;