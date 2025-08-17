'use client';

import { FC } from 'react';

import { IUser } from '@/types/model/IUser';

interface IStudentCardProps {
  student: IUser;
}

export const StudentCard: FC<IStudentCardProps> = ({ student }) => {
  return (
    <div className="student-card">
      <div className="student-info">
        <span className="student-name">{student.username}</span>
        <span className="student-email">{student.email}</span>
      </div>
    </div>
  );
};
