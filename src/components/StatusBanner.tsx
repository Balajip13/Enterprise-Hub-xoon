import React from 'react';
import { ShieldAlert, Clock, Info } from 'lucide-react';

interface StatusBannerProps {
  status: string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ status }) => {
  if (status === 'Approved' || status === 'ADMIN') return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500">
      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Clock className="w-5 h-5" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <p className="text-xs font-black text-amber-900 uppercase tracking-tight">
          Account Under Review
        </p>
        <span className="hidden sm:block w-1 h-1 bg-amber-200 rounded-full"></span>
        <p className="text-[11px] font-medium text-amber-700">
          Some advanced features are restricted until an admin verifies your profile. 
          <span className="hidden md:inline"> This usually takes 24-48 hours.</span>
        </p>
      </div>
    </div>
  );
};

export default StatusBanner;
