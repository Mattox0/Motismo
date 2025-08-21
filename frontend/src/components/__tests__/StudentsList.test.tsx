import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { IUser } from '@/types/model/IUser';

import { StudentsList } from '../StudentsList';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockStudents: IUser[] = [
  { id: '1', username: 'student1', email: 'student1@test.com', role: 'Student' },
  { id: '2', username: 'student2', email: 'student2@test.com', role: 'Student' },
];

describe('StudentsList', () => {
  it('renders students list when students are provided', () => {
    const mockRemoveStudent = jest.fn();
    render(<StudentsList students={mockStudents} onRemoveStudent={mockRemoveStudent} />);

    expect(screen.getByText('classe.students')).toBeInTheDocument();
    expect(screen.getByText('student1')).toBeInTheDocument();
    expect(screen.getByText('student2')).toBeInTheDocument();
  });

  it('renders empty state when no students are provided', () => {
    render(<StudentsList students={[]} />);

    expect(screen.getByText('classe.students')).toBeInTheDocument();
    expect(screen.getByText('classe.noStudents')).toBeInTheDocument();
  });

  it('calls onRemoveStudent when remove button is clicked', () => {
    const mockRemoveStudent = jest.fn();
    render(<StudentsList students={mockStudents} onRemoveStudent={mockRemoveStudent} />);

    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveStudent).toHaveBeenCalledWith('1');
  });

  it('renders without onRemoveStudent prop', () => {
    render(<StudentsList students={mockStudents} />);

    expect(screen.getByText('classe.students')).toBeInTheDocument();
    expect(screen.getByText('student1')).toBeInTheDocument();
    expect(screen.getByText('student2')).toBeInTheDocument();
  });

  it('renders single student correctly', () => {
    const singleStudent: IUser[] = [
      { id: '1', username: 'singleStudent', email: 'single@test.com', role: 'Student' },
    ];
    render(<StudentsList students={singleStudent} />);

    expect(screen.getByText('classe.students')).toBeInTheDocument();
    expect(screen.getByText('singleStudent')).toBeInTheDocument();
  });

  it('renders multiple students with remove functionality', () => {
    const mockRemoveStudent = jest.fn();
    render(<StudentsList students={mockStudents} onRemoveStudent={mockRemoveStudent} />);

    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[1]);
    expect(mockRemoveStudent).toHaveBeenCalledWith('2');
  });
});
