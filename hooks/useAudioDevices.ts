import { useState, useEffect, useCallback } from 'react';

export function useAudioDevices() {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("Media Devices API not supported.");
        return;
      }
      
      // Calling enumerateDevices after getUserMedia (done in components) is key to getting full device labels.
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(d => d.kind === 'audioinput');
      setAudioDevices(audioInputDevices);

      // Use a functional state update to safely determine the next selected device ID.
      // This prevents the callback from depending on `selectedDeviceId` and avoids re-registering event listeners.
      setSelectedDeviceId(currentSelectedId => {
        if (audioInputDevices.length === 0) {
          return ''; // No devices, so clear selection.
        }

        const isSelectedDeviceStillAvailable = audioInputDevices.some(
          d => d.deviceId === currentSelectedId
        );
        
        // If the currently selected device is still available, keep it.
        // Otherwise, default to the first available device in the list. This handles initial load and device removal.
        if (isSelectedDeviceStillAvailable) {
          return currentSelectedId;
        } else {
          return audioInputDevices[0].deviceId;
        }
      });
    } catch (err) {
      console.error("Failed to get audio devices", err);
    }
  }, []); // An empty dependency array ensures this callback function is stable and not recreated on every render.

  useEffect(() => {
    // Initial device scan when the component mounts.
    refreshDevices();
    
    // Listen for any changes in media devices (e.g., plugging in or unplugging a USB microphone).
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    
    // Cleanup by removing the event listener when the component unmounts.
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    };
  }, [refreshDevices]); // The effect re-runs only if `refreshDevices` function instance changes (which it won't).

  return { audioDevices, selectedDeviceId, setSelectedDeviceId, refreshDevices };
}
