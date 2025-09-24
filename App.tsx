import React, { useState } from 'react';
import FhAiLogo from './components/icons/FhAiLogo';
import HomeView from './components/HomeView';
import IdentifyView from './components/tabs/IdentifyView';
import InfringementView from './components/tabs/InfringementView';
import MonitoringView from './components/tabs/MonitoringView';
import AuthenticationView from './components/tabs/AuthenticationView';
import Loader from './components/Loader';
import ResultsDisplay from './components/ResultsDisplay';
import ErrorToast from './components/ErrorToast';
import { identifySong, checkForInfringement, findSongUsage } from './services/geminiService';
import { identifySongWithAcrCloud } from './services/acrcloudService';
import { ApiResult, AudioData, SongDetails, AcrCredentials } from './types';

type Tab = 'identify' | 'enforcement' | 'monitoring' | 'authentication';
type AppState = 'idle' | 'loading' | 'results' | 'error';
type ApiOperation = 'identify' | 'infringe' | 'usage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('identify');
  const [appState, setAppState] = useState<AppState>('idle');
  const [resultData, setResultData] = useState<ApiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [operation, setOperation] = useState<ApiOperation | null>(null);


  const handleApiCall = async (apiFunction: () => Promise<ApiResult>, op: ApiOperation) => {
    setAppState('loading');
    setOperation(op);
    setErrorMessage('');
    try {
      const result = await apiFunction();
      setResultData(result);
      setAppState('results');
    } catch (error) {
      console.error('API Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setAppState('error');
    }
  };

  const handleIdentify = (audioData: AudioData, acrCredentials: AcrCredentials) => {
    const apiFunction = async (): Promise<ApiResult> => {
        // Step 1: Identify with ACRCloud
        const acrResult = await identifySongWithAcrCloud(audioData, acrCredentials);

        // Step 2: If match with ISRC, enrich with Gemini for deep details
        if (acrResult.match && acrResult.isrc && acrResult.title && acrResult.artist) {
            const enrichedResult = await identifySong(audioData, {
                title: acrResult.title,
                artist: acrResult.artist,
                album: acrResult.album || '',
                isrc: acrResult.isrc,
            });

            // Combine results, prioritizing ACRCloud's core data but taking Gemini's enrichment
            return {
                ...enrichedResult,
                ...acrResult,
                match: true,
            };
        }

        // If no match or no ISRC, return ACRCloud result directly
        return acrResult as SongDetails;
    };
    handleApiCall(apiFunction, 'identify');
  };

  const handleInfringement = (audioData: AudioData, acrCredentials: AcrCredentials) => {
     const apiFunction = async (): Promise<ApiResult> => {
        // Step 1: Identify the source audio with ACRCloud
        const acrResult = await identifySongWithAcrCloud(audioData, acrCredentials);

        // Step 2: If match, perform a targeted infringement check with Gemini
        if (acrResult.match && acrResult.title && acrResult.artist) {
            return await checkForInfringement(audioData, acrResult);
        }

        // If no match from ACRCloud, fall back to Gemini's general identify-and-compare
        return await checkForInfringement(audioData);
    };
    handleApiCall(apiFunction, 'infringe');
  };

  const handleFindUsage = (title: string, artist: string) => {
    handleApiCall(() => findSongUsage(title, artist), 'usage');
  }

  const resetState = () => {
    setAppState('idle');
    setResultData(null);
    setErrorMessage('');
    setOperation(null);
  }

  const renderMainContent = () => {
     switch (appState) {
      case 'loading':
        return <Loader operation={operation} />;
      case 'results':
        return <ResultsDisplay result={resultData} onBack={resetState} onFindUsage={handleFindUsage} />;
      default: // 'idle' or 'error'
        return <TabsView activeTab={activeTab} setActiveTab={setActiveTab} onIdentify={handleIdentify} onInfringement={handleInfringement} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1121] text-white flex flex-col items-center justify-center p-4 font-sans antialiased relative">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8" role="banner">
           {appState === 'idle' || appState === 'error' ? <FhAiLogo /> : <FhAiLogo showSubtitle={false} />}
        </header>
        <main className="w-full bg-[#1e293b]/50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center">
          {renderMainContent()}
        </main>
      </div>
      <footer className="mt-8 text-slate-500 text-sm" role="contentinfo">
        <p>Powered by Fh Cloud Ai</p>
      </footer>
      {appState === 'error' && <ErrorToast message={errorMessage} onDismiss={resetState} />}
    </div>
  );
};


// Sub-component for the tabbed interface to keep App.tsx cleaner
interface TabsViewProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onIdentify: (audioData: AudioData, acrCredentials: AcrCredentials) => void;
  onInfringement: (audioData: AudioData, acrCredentials: AcrCredentials) => void;
}

const TabsView: React.FC<TabsViewProps> = ({ activeTab, setActiveTab, onIdentify, onInfringement }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'identify', label: 'Identification' },
    { id: 'enforcement', label: 'Enforcement' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'authentication', label: 'Authentication' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identify':
        return <IdentifyView onIdentify={onIdentify} />;
      case 'enforcement':
        return <InfringementView onInfringement={onInfringement} />;
      case 'monitoring':
        return <MonitoringView />;
      case 'authentication':
        return <AuthenticationView />;
      default:
        return null;
    }
  };

  const getActiveTabClass = (tabId: Tab) => {
    return tabId === activeTab 
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white' 
      : 'text-slate-400 hover:bg-slate-800';
  }

  return (
     <>
      <div className="flex bg-slate-900 rounded-lg p-1 mb-6" role="tablist" aria-label="Audio Detection Modes">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full py-2.5 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white ${getActiveTabClass(tab.id)}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="animate-fade-in"
      >
        {renderTabContent()}
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </>
  )
}


export default App;