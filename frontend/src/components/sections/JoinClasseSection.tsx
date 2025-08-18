'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { JoinClasseForm } from '@/components/forms/JoinClasseForm';

interface IJoinClasseSectionProps {
  onSubmit: (data: { code: string }) => void;
  isLoading?: boolean;
}

export const JoinClasseSection: FC<IJoinClasseSectionProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <div className="join-classe-section">
      <div className="join-classe-section__header">
        <p className="join-classe-section__description">{t('classe.join.description')}</p>
      </div>

      <div className="join-classe-section__content">
        <JoinClasseForm onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};
