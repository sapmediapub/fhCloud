import React, { useState, useRef } from 'react';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';
import UploadIcon from '../icons/UploadIcon';
import DownloadIcon from '../icons/DownloadIcon';
import SettingsIcon from '../icons/SettingsIcon';
import ImageIcon from '../icons/ImageIcon';

type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type WatermarkType = 'text' | 'logo';

interface AppliedSettings {
  type: WatermarkType;
  text?: string;
  logoFileName?: string;
  font?: string;
  opacity: number;
  position: WatermarkPosition;
  rotation: number;
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


const AuthenticationView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Watermark settings state
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('FH Cloud AI Protected');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [rotation, setRotation] = useState(0);
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');
  const [appliedSettings, setAppliedSettings] = useState<AppliedSettings | null>(null);


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsFileLoading(true);
      try {
        let fileToSet = file;
        // If the uploaded file is audio, process and potentially trim it.
        if (file.type.startsWith('audio/')) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
            let bufferToProcess = decodedBuffer;
            let newFileName = `${file.name.split('.').slice(0, -1).join('.')}.wav`;
    
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
              newFileName = `trimmed_${newFileName}`;
            }
            
            const wavBlob = bufferToWav(bufferToProcess);
            fileToSet = new File([wavBlob], newFileName, { type: 'audio/wav' });
        }
        setSelectedFile(fileToSet);
        setResultUrl(null);
        setResultFileName('');
      } catch (error) {
        console.error("Error processing file:", error);
        alert(error instanceof Error ? error.message : "Failed to process the file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setIsFileLoading(false);
      }
    }
  };
  
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      if (logoPreviewUrl) {
          URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleLogoUploadClick = () => logoInputRef.current?.click();

  const handleApplyWatermark = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const currentSettings: AppliedSettings = {
      type: watermarkType,
      text: watermarkType === 'text' ? watermarkText : undefined,
      logoFileName: watermarkType === 'logo' ? logoFile?.name : undefined,
      font: watermarkType === 'text' ? fontFamily : undefined,
      opacity: watermarkOpacity,
      position: watermarkPosition,
      rotation: rotation,
    };
    setAppliedSettings(currentSettings);
    
    console.log('Applying watermark with settings:', currentSettings);

    setTimeout(() => {
      const url = URL.createObjectURL(selectedFile);
      setResultUrl(url);
      setResultFileName(`watermarked_${selectedFile.name}`);
      setIsProcessing(false);
    }, 2000);
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    
    setSelectedFile(null);
    setResultUrl(null);
    setResultFileName('');
    setAppliedSettings(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (logoInputRef.current) logoInputRef.current.value = "";
    
    // Reset settings to default
    setWatermarkType('text');
    setWatermarkText('FH Cloud AI Protected');
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setFontFamily('Arial, sans-serif');
    setRotation(0);
    setWatermarkOpacity(50);
    setWatermarkPosition('bottom-right');
  };
  
  const renderSettingsSummary = (settings: AppliedSettings | null) => {
    if (!settings) return null;
    let summary = `Type: ${settings.type}, Opacity: ${settings.opacity}%, Position: ${settings.position.replace('-', ' ')}, Rotation: ${settings.rotation}°`;
    if (settings.type === 'text' && settings.font) {
        summary += `, Font: ${settings.font.split(',')[0].replace(/'/g, '')}`;
    }
    return <span className="text-xs text-slate-500 capitalize">{summary}</span>;
  };
  
  const renderContent = () => {
    if (isFileLoading) {
        return (
          <div className="flex flex-col items-center justify-center text-center p-6 h-48">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-purple-300 font-semibold animate-pulse">Processing file...</p>
          </div>
        );
    }

    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-48">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-green-300 font-semibold animate-pulse">Applying invisible watermark...</p>
        </div>
      );
    }

    if (resultUrl) {
      return (
        <div className="text-center p-6 animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-green-900/50 text-green-400 rounded-full flex items-center justify-center mb-4">
             <ShieldCheckIcon className="w-8 h-8"/>
          </div>
          <h3 className="font-semibold text-lg text-white mb-2">Watermark Applied Successfully</h3>
          <p className="text-sm text-slate-400 mb-6">
            Your file <span className="font-medium text-slate-300">{resultFileName}</span> is ready for download. <br/>
            {renderSettingsSummary(appliedSettings)}
          </p>
          <div className="space-y-3">
            <a
              href={resultUrl}
              download={resultFileName}
              className="w-full max-w-xs py-3 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
            >
              <DownloadIcon />
              Download File
            </a>
            <button
              onClick={handleReset}
              className="w-full max-w-xs py-3 bg-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Process Another File
            </button>
          </div>
        </div>
      );
    }

    if (selectedFile) {
      return (
         <div className="animate-fade-in">
            <div className="text-center p-4 bg-slate-900/50 rounded-t-lg border border-b-0 border-slate-700">
              <h3 className="font-semibold text-lg text-white">File Ready for Processing</h3>
              <p className="text-sm text-slate-400 truncate">{selectedFile.name}</p>
            </div>
            {/* Configuration Section */}
            <div className="p-4 sm:p-6 text-left bg-slate-800/30 rounded-b-lg border border-slate-700">
               <h3 className="flex items-center gap-2 font-semibold text-slate-200 mb-4">
                  <SettingsIcon />
                  Configure Watermark
              </h3>
              <div className="space-y-4">
                {/* Watermark Type */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Watermark Type</label>
                  <div className="flex bg-slate-900 rounded-lg p-1">
                      <button onClick={() => setWatermarkType('text')} className={`w-full py-1.5 text-xs rounded-md transition-colors ${watermarkType === 'text' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Text</button>
                      <button onClick={() => setWatermarkType('logo')} className={`w-full py-1.5 text-xs rounded-md transition-colors ${watermarkType === 'logo' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>Logo</button>
                  </div>
                </div>

                {/* Conditional Inputs */}
                {watermarkType === 'text' ? (
                   <>
                    <div>
                      <label htmlFor="watermark-text" className="text-xs text-slate-400 mb-1 block">Watermark Text</label>
                      <input id="watermark-text" type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-sm" />
                    </div>
                    <div>
                        <label htmlFor="watermark-font" className="text-xs text-slate-400 mb-1 block">Font Family</label>
                        <select 
                          id="watermark-font" 
                          value={fontFamily} 
                          onChange={(e) => setFontFamily(e.target.value)} 
                          className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-sm appearance-none bg-no-repeat"
                          style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em'}}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Verdana, sans-serif">Verdana</option>
                          <option value="'Times New Roman', Times, serif">Times New Roman</option>
                          <option value="'Courier New', Courier, monospace">Courier New</option>
                          <option value="Georgia, serif">Georgia</option>
                        </select>
                        <div 
                          className="mt-2 w-full h-16 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg px-4 text-slate-200 text-2xl"
                          style={{ fontFamily }}
                          aria-label="Font preview"
                        >
                          <p className="truncate" title={watermarkText || "Sample Text"}>{watermarkText || "Sample Text"}</p>
                        </div>
                      </div>
                   </>
                ) : (
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Logo Preview & Upload</label>
                    {logoPreviewUrl ? (
                        <div className="group relative" onClick={handleLogoUploadClick} role="button" tabIndex={0} aria-label="Change logo">
                            <img src={logoPreviewUrl} alt="Logo preview" className="w-full h-40 object-contain bg-slate-900/50 rounded-lg border border-slate-700 p-2 cursor-pointer" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                                <span>Change Logo</span>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={handleLogoUploadClick}
                            className="w-full h-40 flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-slate-800/50 transition-colors"
                            role="button"
                            tabIndex={0}
                            aria-label="Upload logo"
                        >
                            <ImageIcon className="w-10 h-10 text-slate-500 mb-2" />
                            <p className="text-sm font-semibold text-slate-400">Click to upload logo</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, or SVG recommended</p>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2 truncate text-center">{logoFile?.name || "No logo selected."}</p>
                </div>
                )}
                
                {/* Common Settings */}
                <div>
                  <label htmlFor="watermark-opacity" className="text-xs text-slate-400 mb-1 flex justify-between"><span>Opacity</span><span>{watermarkOpacity}%</span></label>
                  <input id="watermark-opacity" type="range" min="0" max="100" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider-green" />
                </div>
                 <div>
                  <label htmlFor="watermark-rotation" className="text-xs text-slate-400 mb-1 flex justify-between"><span>Rotation</span><span>{rotation}°</span></label>
                  <input id="watermark-rotation" type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider-green" />
                </div>
                <div>
                  <label htmlFor="watermark-position" className="text-xs text-slate-400 mb-1 block">Position</label>
                  <select id="watermark-position" value={watermarkPosition} onChange={(e) => setWatermarkPosition(e.target.value as WatermarkPosition)} className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-sm appearance-none bg-no-repeat bg-right-3" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em'}}>
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="center">Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                 <button onClick={handleReset} className="w-full py-3 bg-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-600 transition-colors">Cancel</button>
                 <button onClick={handleApplyWatermark} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity">Apply Watermark</button>
            </div>
         </div>
      );
    }

    return (
       <div 
        className="p-6 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500 hover:bg-slate-800/50 hover:text-white transition-all duration-300 cursor-pointer"
        onClick={handleUploadClick}
        onKeyPress={(e) => e.key === 'Enter' && handleUploadClick()}
        role="button"
        tabIndex={0}
       >
        <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="w-16 h-16 mb-4 text-slate-500">
                <UploadIcon />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">Secure Your Assets</h3>
            <p className="text-sm text-center mb-4">Click to upload your content to apply a unique, invisible watermark.</p>
            <span className="w-full max-w-xs py-3 bg-slate-700 rounded-lg font-semibold text-slate-300">Upload Content</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-green-400 mb-2 flex items-center justify-center gap-2">
        <ShieldCheckIcon className="w-7 h-7" />
        Content Authentication
      </h2>
      <p className="text-center text-slate-400 mb-8">
        Apply invisible watermarks to your audio, video, or image files for authentication and traceability. Protect your IP and detect AI-generated deepfakes.
      </p>
      
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="audio/*,video/*,image/*" />
      <input type="file" ref={logoInputRef} onChange={handleLogoSelect} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
       
       {renderContent()}

       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        .custom-slider-green::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #22c55e; /* green-500 */
            border-radius: 50%;
            cursor: pointer;
        }
        .custom-slider-green::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: #22c55e; /* green-500 */
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
      `}</style>
    </div>
  );
};

export default AuthenticationView;