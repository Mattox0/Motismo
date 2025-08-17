'use client';

import { FC } from 'react';

import { BackButton } from './BackButton';

interface IErrorStateProps {
  title: string;
  onBackClick: () => void;
  className?: string;
}

export const ErrorState: FC<IErrorStateProps> = ({ title, onBackClick, className = '' }) => {
  return (
    <div className={`classe-detail-page__error ${className}`}>
      <h2>{title}</h2>
      <BackButton onClick={onBackClick} />
    </div>
  );
};
