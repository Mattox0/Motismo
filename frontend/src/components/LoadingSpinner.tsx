'use client';

import { FC } from 'react';

interface ILoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: FC<ILoadingSpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`parent-loader ${className}`}>
      <span className="loader"></span>
    </div>
  );
};
