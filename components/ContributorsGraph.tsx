import React from 'react';
import PenIcon from './icons/PenIcon';
import ProducerIcon from './icons/ProducerIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import DatabaseIcon from './icons/DatabaseIcon';

interface ContributorsGraphProps {
  artist?: string;
  writers?: string[];
  producers?: string[];
  publisher?: string;
}

const ContributorLine: React.FC<{ icon: React.ReactNode; label: string; names?: string[] | string | null }> = ({ icon, label, names }) => {
    if (!names || (Array.isArray(names) && names.length === 0)) {
        return null;
    }
    const nameString = Array.isArray(names) ? names.join(', ') : names;
    
    return (
        <div className="flex items-start gap-4 text-sm">
            <div className="flex flex-col items-center self-stretch">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-purple-400 border border-slate-700">
                   {icon}
                </div>
                <div className="w-px h-full bg-slate-700"></div>
            </div>
            <div className="pt-1 pb-4">
                <p className="text-slate-400">{label}</p>
                <p className="text-slate-100 font-medium">{nameString}</p>
            </div>
        </div>
    );
};


const ContributorsGraph: React.FC<ContributorsGraphProps> = ({ artist, writers, producers, publisher }) => {
  return (
    <div className="space-y-0">
        <ContributorLine icon={<MicrophoneIcon className="w-5 h-5"/>} label="Artist" names={artist} />
        <ContributorLine icon={<PenIcon />} label="Writers" names={writers} />
        <ContributorLine icon={<ProducerIcon />} label="Producers" names={producers} />
        <ContributorLine icon={<DatabaseIcon className="w-5 h-5"/>} label="Publisher" names={publisher} />
    </div>
  );
};

export default ContributorsGraph;