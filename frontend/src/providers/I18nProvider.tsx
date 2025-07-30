'use client';

import React, { useEffect, useState } from 'react';

import { SplashScreen } from '@/components/SplashScreen';
import i18n from '@/i18n';

interface II18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<II18nProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init().then(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};
