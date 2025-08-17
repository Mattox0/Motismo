'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ClasseCard } from '@/components/ClasseCard';
import { EmptyState } from '@/components/EmptyState';
import { IClasse } from '@/types/model/IClasse';

interface IClasseListSectionProps {
  classes: IClasse[];
  isLoading: boolean;
  onEditClasse?: (classe: IClasse) => void;
  onViewClasse?: (classe: IClasse) => void;
  onDeleteClasse?: (classe: IClasse) => void;
}

export const ClasseListSection: FC<IClasseListSectionProps> = ({
  classes,
  isLoading,
  onEditClasse,
  onViewClasse,
  onDeleteClasse,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="classe-list-section">
        <div className="parent-loader">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="classe-list-section">
        <EmptyState title={t('classe.noClasses')} description={t('classe.noClassesDescription')} />
      </div>
    );
  }

  return (
    <div className="classe-list-section">
      <div className="classe-list">
        {classes.map(classe => (
          <ClasseCard
            key={classe.id}
            classe={classe}
            onEditClick={onEditClasse ? () => onEditClasse(classe) : undefined}
            onViewClick={onViewClasse ? () => onViewClasse(classe) : undefined}
            onDeleteClick={onDeleteClasse ? () => onDeleteClasse(classe) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
