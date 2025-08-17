'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IClasse } from '@/types/model/IClasse';

import { BackButton } from './BackButton';

interface IClasseHeaderProps {
  classe: IClasse;
  onBackClick: () => void;
}

export const ClasseHeader: FC<IClasseHeaderProps> = ({ classe, onBackClick }) => {
  const { t } = useTranslation();

  return (
    <div className="classe-detail-page__header">
      <BackButton onClick={onBackClick} />
      <h1 className="classe-detail-page__title">{classe.name}</h1>
      <div className="classe-detail-page__code">
        <span className="code-label">{t('classe.code')}:</span>
        <span className="code-value">{classe.code}</span>
      </div>
    </div>
  );
};
