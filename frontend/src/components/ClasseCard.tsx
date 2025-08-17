'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IClasse } from '@/types/model/IClasse';

import { Button } from './forms/Button';

interface IClasseCardProps {
  classe: IClasse;
  onEditClick?: () => void;
  onViewClick?: () => void;
  onDeleteClick?: () => void;
}

export const ClasseCard: FC<IClasseCardProps> = ({
  classe,
  onEditClick,
  onViewClick,
  onDeleteClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="classe-card">
      <div className="classe-card__header">
        <h3 className="classe-card__title">{classe.name}</h3>
        <span className="classe-card__code">{classe.code}</span>
      </div>

      <div className="classe-card__stats">
        <div className="classe-card__stat">
          <span className="classe-card__stat-label">{t('classe.students')}</span>
          <span className="classe-card__stat-value">{classe.students.length}</span>
        </div>
        <div className="classe-card__stat">
          <span className="classe-card__stat-label">{t('classe.teachers')}</span>
          <span className="classe-card__stat-value">{classe.teachers.length}</span>
        </div>
      </div>

      <div className="classe-card__actions">
        <div className="action-row">
          {onViewClick && (
            <Button variant="primary" onClick={onViewClick}>
              {t('classe.view')}
            </Button>
          )}
          {onEditClick && (
            <Button variant="secondary" onClick={onEditClick}>
              {t('classe.edit')}
            </Button>
          )}
        </div>
        {onDeleteClick && (
          <Button variant="error" onClick={onDeleteClick} className="delete-button">
            {t('classe.delete')}
          </Button>
        )}
      </div>
    </div>
  );
};
