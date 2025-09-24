import React, { useState } from 'react';
import { ApiResult, InfringementAnalysis, SongDetails, UsageResult } from '../types';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import FindUsageIcon from './icons/FindUsageIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import AcousticFingerprintVisualizer from './AcousticFingerprintVisualizer';
import ContributorsGraph from './ContributorsGraph';
import CreditsView from './CreditsView';

interface ResultsDisplayProps {
  result: ApiResult | null;
  onBack: () => void;
  onFindUsage: (title: string, artist: string) => void;
}

const isSongDetails = (res: ApiResult): res is SongDetails => 'match' in res;
const isInfringement = (res: ApiResult): res is InfringementAnalysis => 'isInfringing' in res;
const isUsageResult = (res: ApiResult): res is UsageResult => 'sources' in res;

const SongDetailsView: React.FC<{result: SongDetails, onFindUsage: (title: string, artist: string) => void, onBack: () => void}> = ({ result, onFindUsage, onBack }) => {
    const [showCredits, setShowCredits] = useState(false);

    if (!result.match) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">No Match Found</h2>
                <p className="text-slate-400">{result.reasoning || "We couldn't identify the song from the provided audio."}</p>
                 <button 
                    onClick={onBack} 
                    className="w-full mt-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
                >
                    Identify Another Song
                </button>
            </div>
        )
    }
    
    return (
        <>
        {showCredits && <CreditsView song={result} onClose={() => setShowCredits(false)} />}
        <div className="text-slate-300">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-3xl font-bold">FH</span>
                </div>
                <div className="overflow-hidden flex-grow">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2 flex-wrap">
                        <span className="truncate">{result.title}</span>
                        <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    </h2>
                    <p className="text-lg text-slate-400 truncate">{result.artist}</p>
                     {result.isrc && (
                        <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mt-2 inline-block">
                            Verified by FhCloud
                        </span>
                    )}
                </div>
            </div>

            <hr className="border-slate-700 my-6" />

            {/* Details */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">Recording Details</h3>
                    <div className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-2 text-sm">
                        <span className="text-slate-400">Album</span><span className="text-slate-100 font-medium text-right truncate">{result.album || 'N/A'}</span>
                        <span className="text-slate-400">Genre</span><span className="text-slate-100 font-medium text-right truncate">{result.genre || 'N/A'}</span>
                        <span className="text-slate-400">Release Date</span><span className="text-slate-100 font-medium text-right">{result.releaseDate || 'N/A'}</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">Composition & Publishing</h3>
                    <ContributorsGraph
                        artist={result.artist}
                        writers={result.writers}
                        producers={result.producers}
                        publisher={result.publisher}
                    />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">Fingerprint Data</h3>
                    <div className="space-y-3">
                      {result.acousticFingerprint && <AcousticFingerprintVisualizer fingerprint={result.acousticFingerprint} />}
                      <div className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-2 text-sm pt-2">
                        <span className="text-slate-400">ISRC</span><span className="text-slate-100 font-mono font-medium text-right truncate">{result.isrc || 'N/A'}</span>
                        <span className="text-slate-400">UPC</span><span className="text-slate-100 font-mono font-medium text-right truncate">{result.upc || 'N/A'}</span>
                      </div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowCredits(true)}
                        className="w-full py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
                     >
                        View Credits
                     </button>
                    {result.title && result.artist && (
                        <button 
                            onClick={() => onFindUsage(result.title!, result.artist!)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
                        >
                            <FindUsageIcon />
                            Find Usage
                        </button>
                    )}
                 </div>
                 <button 
                    onClick={onBack} 
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white"
                >
                    Identify Another Song
                </button>
            </div>
        </div>
        </>
    );
}

const InfringementView: React.FC<{result: InfringementAnalysis, onBack: () => void}> = ({ result, onBack }) => {
    const confidenceColor = result.confidence > 0.7 ? 'bg-red-500' : result.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
    
    const StatusPill = ({ isInfringing }: { isInfringing: boolean }) => (
      <div className={`flex items-center justify-center gap-3 p-4 rounded-lg mb-6 border ${isInfringing ? 'bg-red-900/50 text-red-300 border-red-500/30' : 'bg-green-900/50 text-green-300 border-green-500/30'}`}>
        {isInfringing ? <ExclamationTriangleIcon /> : <ShieldCheckIcon />}
        <span className="text-xl font-bold tracking-wider">{isInfringing ? 'INFRINGEMENT LIKELY' : 'INFRINGEMENT UNLIKELY'}</span>
      </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-purple-400 mb-6">Copyright Compliance Report</h2>
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 space-y-6 text-slate-300">
                <StatusPill isInfringing={result.isInfringing} />
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-slate-300">Confidence Score</span>
                        <span className="font-bold text-slate-100">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className={`${confidenceColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${result.confidence * 100}%` }}></div>
                    </div>
                </div>

                <hr className="border-slate-700" />

                <div>
                    <h3 className="font-semibold text-slate-100 mb-2 text-lg">Musicologist Summary</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Similarities
                        </h4>
                        <ul className="space-y-2">
                            {result.similarities.map((s, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-400"><span className="text-green-500 mt-1">&#8226;</span><span>{s}</span></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                          Differences
                        </h4>
                         <ul className="space-y-2">
                            {result.differences.map((d, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-400"><span className="text-yellow-500 mt-1">&#8226;</span><span>{d}</span></li>)}
                        </ul>
                    </div>
                </div>
            </div>
             <button onClick={onBack} className="w-full mt-8 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white">
                Check Another Song
            </button>
        </div>
    )
}

const UsageResultView: React.FC<{result: UsageResult, onBack: () => void}> = ({ result, onBack }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-teal-300 mb-4">Online Usage Report</h2>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 space-y-4 text-slate-300 max-h-96 overflow-y-auto">
                 <div>
                    <h3 className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">Summary</h3>
                    <p className="text-sm text-slate-400">{result.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">Detected Sources</h3>
                     {result.sources.length > 0 ? (
                        <ul className="space-y-2">
                           {result.sources.map((source, i) => (
                               <li key={i} className="text-sm bg-slate-800 p-2 rounded-md">
                                   <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline truncate block">
                                    {source.web.title || source.web.uri}
                                   </a>
                               </li>
                           ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-slate-500">No specific online sources were found by the search.</p>
                     )}
                </div>
            </div>
             <button onClick={onBack} className="w-full mt-8 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white">
                Check Another Song
            </button>
        </div>
    )
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onBack, onFindUsage }) => {
  if (!result) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-slate-400 mb-6">Could not retrieve results. Please try again.</p>
        <button onClick={onBack} className="w-full mt-8 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {isSongDetails(result) && <SongDetailsView result={result} onFindUsage={onFindUsage} onBack={onBack} />}
      {isInfringement(result) && <InfringementView result={result} onBack={onBack}/>}
      {isUsageResult(result) && <UsageResultView result={result} onBack={onBack} />}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;