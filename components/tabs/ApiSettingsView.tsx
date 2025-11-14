import React, { useState } from 'react';

const ApiSettingsView: React.FC = () => {
  const [endpointUrl, setEndpointUrl] = useState('https://api.your-engine.com/detect');
  const [apiKey, setApiKey] = useState('');
  const [engineLabel, setEngineLabel] = useState('FH Cloud Engine');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to localStorage or a config service
    alert('Settings saved! (This is a demo)');
  };

  return (
    <div className="space-y-8 text-slate-300 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-0">
        API Settings
      </h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 items-start border-t border-slate-700 pt-6">
          <label htmlFor="api-endpoint" className="font-semibold md:text-right text-slate-400">
            API Endpoint URL
          </label>
          <div className="md:col-span-3">
            <input
              id="api-endpoint"
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
            />
            <p className="text-sm text-slate-500 mt-2">
              The detection engine URL that will receive the uploaded audio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 items-start border-t border-slate-700 pt-6">
          <label htmlFor="api-key" className="font-semibold md:text-right text-slate-400">
            API Key
          </label>
          <div className="md:col-span-3">
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
            />
            <p className="text-sm text-slate-500 mt-2">
              Optional: API key or token, if your engine requires authentication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 items-start border-t border-slate-700 pt-6">
          <label htmlFor="engine-label" className="font-semibold md:text-right text-slate-400">
            Engine Label
          </label>
          <div className="md:col-span-3">
            <input
              id="engine-label"
              type="text"
              value={engineLabel}
              onChange={(e) => setEngineLabel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
            />
            <p className="text-sm text-slate-500 mt-2">
              Name of the engine for your own reference (shown in logs).
            </p>
          </div>
        </div>

        <div className="flex justify-start pt-4 border-t border-slate-700">
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 rounded-md font-semibold text-white hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
          >
            Save Settings
          </button>
        </div>
      </form>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ApiSettingsView;