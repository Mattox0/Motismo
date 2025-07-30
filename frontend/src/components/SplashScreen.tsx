'use client';

import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
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
          <h1>Motismo</h1>
          <p>Chargement en cours...</p>
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
