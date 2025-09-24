import React from 'react';
import FhAiLogo from './icons/FhAiLogo';
import StrengthPillar from './StrengthPillar';
import DatabaseIcon from './icons/DatabaseIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import TargetIcon from './icons/TargetIcon';

const HomeView: React.FC = () => (
  <div className="text-center mb-8">
    <FhAiLogo />
    <div className="grid md:grid-cols-3 gap-4 mt-12 animate-fade-in">
      <StrengthPillar
        icon={<DatabaseIcon />}
        title="Rights & Monetization"
        description="Scalable audio/video fingerprinting, automated enforcement pipelines, and attribution marketplace for royalty routing."
      />
      <StrengthPillar
        icon={<TargetIcon />}
        title="Industry-Grade Accuracy"
        description="Proprietary acoustic fingerprinting identifies content with extreme precision, including remixes, covers, and alterations."
      />
      <StrengthPillar
        icon={<ShieldCheckIcon className="w-8 h-8" />}
        title="Content Authentication"
        description="Invisible watermarking and traceability for images, audio, and video to combat deepfakes and secure IP."
      />
    </div>
     <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
  </div>
);

export default HomeView;