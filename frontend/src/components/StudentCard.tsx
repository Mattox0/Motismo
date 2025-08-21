'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IUser } from '@/types/model/IUser';

interface IStudentCardProps {
  student: IUser;
  onRemoveStudent?: (studentId: string) => void;
}

export const StudentCard: FC<IStudentCardProps> = ({ student, onRemoveStudent }) => {
  const { t } = useTranslation();

  return (
    <div className="student-card">
      <div className="student-info">
        <span className="student-name">{student.username}</span>
        <span className="student-email">{student.email}</span>
      </div>
      {onRemoveStudent && (
        <button
          className="student-card__remove-btn"
          onClick={() => onRemoveStudent(student.id)}
          aria-label={t('student.removeStudent')}
        >
          ✕
        </button>
      )}
    </div>
  );
};
