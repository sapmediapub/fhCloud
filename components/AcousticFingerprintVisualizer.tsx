import React, { useMemo } from 'react';

interface AcousticFingerprintVisualizerProps {
  fingerprint: string;
}

const AcousticFingerprintVisualizer: React.FC<AcousticFingerprintVisualizerProps> = ({ fingerprint }) => {
  const bars = useMemo(() => {
    if (!fingerprint || fingerprint.length < 2) return [];
    
    // Create 32 bars from a 64-char hex string
    return fingerprint.match(/.{1,2}/g)?.map((hex, index) => {
      const value = parseInt(hex, 16); // value from 0 to 255
      const height = (value / 255) * 100; // height in percentage
      
      // Map value to a color gradient (blue -> purple -> pink)
      const hue = 240 + (value / 255) * 60; 
      const color = `hsl(${hue}, 80%, 60%)`;

      return { key: `${index}-${hex}`, height, color };
    }) || [];
  }, [fingerprint]);

  if (!bars.length) {
    return (
        <div className="flex items-center justify-center h-16 bg-slate-800/50 rounded-lg text-xs text-slate-500">
            Acoustic fingerprint data not available.
        </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700">
      <div className="flex items-end justify-center gap-px h-16 w-full">
        {bars.map(bar => (
          <div
            key={bar.key}
            className="w-full rounded-sm"
            style={{
              height: `${bar.height}%`,
              backgroundColor: bar.color,
              minHeight: '2px'
            }}
            title={`Value: ${Math.round(bar.height)}%`}
          />
        ))}
      </div>
    </div>
  );
};

export default AcousticFingerprintVisualizer;