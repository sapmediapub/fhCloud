import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'closed') {
        return;
    }
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      if (canvasCtx) {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        
        // Background
        canvasCtx.fillStyle = 'rgb(30 41 59)'; // slate-800
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        
        // Calculate RMS for volume
        let sumSquares = 0.0;
        for (const amplitude of dataArray) {
            const normalized = (amplitude / 128.0) - 1.0; // convert 0-255 to -1 to 1 range
            sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Scale the meter width based on RMS. The multiplier helps make quiet sounds visible.
        const meterWidth = Math.min(rms * WIDTH * 7, WIDTH); 

        // Create a gradient for the bar
        const gradient = canvasCtx.createLinearGradient(0, 0, WIDTH, 0);
        gradient.addColorStop(0, '#4ade80'); // green-400
        gradient.addColorStop(0.7, '#facc15'); // yellow-400
        gradient.addColorStop(0.9, '#ef4444'); // red-600
        canvasCtx.fillStyle = gradient;

        // Draw the meter bar
        canvasCtx.fillRect(0, 0, meterWidth, HEIGHT);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  // A shorter height is more suitable for a VU meter bar.
  return <canvas ref={canvasRef} width="200" height="20" className="rounded" />;
};

export default AudioVisualizer;