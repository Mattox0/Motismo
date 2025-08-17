'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IUser } from '@/types/model/IUser';

import { EmptyState } from './EmptyState';
import { StudentCard } from './StudentCard';

interface IStudentsListProps {
  students: IUser[];
}

export const StudentsList: FC<IStudentsListProps> = ({ students }) => {
  const { t } = useTranslation();

  if (students.length === 0) {
    return (
      <div className="classe-detail-page__section">
        <h2 className="section-title">{t('classe.students')}</h2>
        <EmptyState title={t('classe.noStudents')} />
      </div>
    );
  }

  return (
    <div className="classe-detail-page__section">
      <h2 className="section-title">{t('classe.students')}</h2>
      <div className="students-list">
        {students.map((student: IUser) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
};
