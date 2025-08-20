'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface IBackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: FC<IBackButtonProps> = ({ onClick, className = '' }) => {
  const { t } = useTranslation();

  return (
    <button onClick={onClick} className={`back-button ${className}`}>
      ← {t('common.back')}
    </button>
  );
};
