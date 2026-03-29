import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useActiveTab = (basePath: string, defaultTab: string = 'dashboard') => {
  const location = useLocation();
  
  const getTabFromPath = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const baseIdx = segments.indexOf(basePath.replace(/^\//, ''));
    
    if (baseIdx !== -1 && segments[baseIdx + 1]) {
      // Handle nested referrals paths if needed, or just return the next segment
      if (segments[baseIdx + 1] === 'referrals' && segments[baseIdx + 2]) {
        return `referrals/${segments[baseIdx + 2]}`;
      }
      return segments[baseIdx + 1];
    }
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  return [activeTab, setActiveTab] as const;
};
