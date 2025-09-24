import React from 'react';
import { AcrCredentials } from '../../types';

interface AcrCloudCredentialsProps {
  credentials: AcrCredentials;
  onCredentialsChange: (credentials: AcrCredentials) => void;
}

const AcrCloudCredentials: React.FC<AcrCloudCredentialsProps> = ({ credentials, onCredentialsChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-4 mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-300">ACRCloud Credentials</h3>
      <p className="text-xs text-slate-500 -mt-2">Your credentials are required for high-accuracy identification and are saved securely in your browser's local storage.</p>
      <div>
        <label htmlFor="host" className="text-xs text-slate-400 mb-1 block">Host</label>
        <input
          id="host"
          name="host"
          type="text"
          value={credentials.host}
          onChange={handleChange}
          placeholder="identify-eu-west-1.acrcloud.com"
          className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
        />
      </div>
      <div>
        <label htmlFor="accessKey" className="text-xs text-slate-400 mb-1 block">Access Key</label>
        <input
          id="accessKey"
          name="accessKey"
          type="text"
          value={credentials.accessKey}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
        />
      </div>
      <div>
        <label htmlFor="secretKey" className="text-xs text-slate-400 mb-1 block">Secret Key</label>
        <input
          id="secretKey"
          name="secretKey"
          type="password"
          value={credentials.secretKey}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow text-sm"
        />
      </div>
    </div>
  );
};

export default AcrCloudCredentials;
