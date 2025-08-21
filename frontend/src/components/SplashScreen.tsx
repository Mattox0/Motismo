'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export const SplashScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="splash-screen" data-testid="splash-screen">
      <div className="splash-content">
        <div className="splash-icon">
          <div className="animated-icon">
            <div className="icon-dot"></div>
            <div className="icon-dot"></div>
            <div className="icon-dot"></div>
            <div className="icon-dot"></div>
          </div>
        </div>
        <div className="splash-text">
          <h1>{t('splash.title')}</h1>
          <p>{t('splash.loading')}</p>
        </div>
        <div className="splash-loader">
          <div className="pulse-loader">
            <div className="pulse"></div>
            <div className="pulse"></div>
            <div className="pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
