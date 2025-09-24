import React, { useEffect, useRef } from 'react';

interface LiveIndicatorProps {
  stream: MediaStream | null;
}

const LiveIndicator: React.FC<LiveIndicatorProps> = ({ stream }) => {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !indicatorRef.current) return;

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioContext = audioContextRef.current;
    
    if (audioContext.state === 'closed') return;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      let sumSquares = 0.0;
      for (const amplitude of dataArray) {
        const normalized = (amplitude / 128.0) - 1.0;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);
      
      const scale = 1 + Math.min(rms * 4, 0.75);
      const opacity = 0.6 + Math.min(rms * 2, 0.4);

      if (indicatorRef.current) {
        indicatorRef.current.style.transform = `scale(${scale})`;
        indicatorRef.current.style.opacity = `${opacity}`;
      }
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      source.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  return (
      <div 
        ref={indicatorRef} 
        className="w-3 h-3 bg-red-500 rounded-full transition-all duration-100 ease-out"
        style={{ transform: 'scale(1)', opacity: '0.6' }}
      />
  );
};

export default LiveIndicator;
