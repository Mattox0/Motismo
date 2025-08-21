import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { IClasse } from '@/types/model/IClasse';

import { ClasseCard } from '../ClasseCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockClasse: IClasse = {
  id: '1',
  name: 'Test Class',
  code: 'TEST123',
  students: [
    { id: '1', username: 'student1', email: 'student1@test.com', role: 'Student' },
    { id: '2', username: 'student2', email: 'student2@test.com', role: 'Student' },
  ],
  teachers: [{ id: '3', username: 'teacher1', email: 'teacher1@test.com', role: 'Teacher' }],
};

describe('ClasseCard', () => {
  it('renders classe information correctly', () => {
    render(<ClasseCard classe={mockClasse} />);

    expect(screen.getByText('Test Class')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders view button when onViewClick is provided', () => {
    const mockViewClick = jest.fn();
    render(<ClasseCard classe={mockClasse} onViewClick={mockViewClick} />);

    const viewButton = screen.getByText('classe.view');
    expect(viewButton).toBeInTheDocument();

    fireEvent.click(viewButton);
    expect(mockViewClick).toHaveBeenCalledTimes(1);
  });

  it('renders edit button when onEditClick is provided', () => {
    const mockEditClick = jest.fn();
    render(<ClasseCard classe={mockClasse} onEditClick={mockEditClick} />);

    const editButton = screen.getByText('classe.edit');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(mockEditClick).toHaveBeenCalledTimes(1);
  });

  it('renders delete button when onDeleteClick is provided', () => {
    const mockDeleteClick = jest.fn();
    render(<ClasseCard classe={mockClasse} onDeleteClick={mockDeleteClick} />);

    const deleteButton = screen.getByText('classe.delete');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    expect(mockDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('renders all buttons when all handlers are provided', () => {
    const mockViewClick = jest.fn();
    const mockEditClick = jest.fn();
    const mockDeleteClick = jest.fn();

    render(
      <ClasseCard
        classe={mockClasse}
        onViewClick={mockViewClick}
        onEditClick={mockEditClick}
        onDeleteClick={mockDeleteClick}
      />
    );

    expect(screen.getByText('classe.view')).toBeInTheDocument();
    expect(screen.getByText('classe.edit')).toBeInTheDocument();
    expect(screen.getByText('classe.delete')).toBeInTheDocument();
  });

  it('does not render buttons when handlers are not provided', () => {
    render(<ClasseCard classe={mockClasse} />);

    expect(screen.queryByText('classe.view')).not.toBeInTheDocument();
    expect(screen.queryByText('classe.edit')).not.toBeInTheDocument();
    expect(screen.queryByText('classe.delete')).not.toBeInTheDocument();
  });

  it('displays correct student and teacher counts', () => {
    const classeWithMorePeople: IClasse = {
      ...mockClasse,
      students: [
        { id: '1', username: 'student1', email: 'student1@test.com', role: 'Student' },
        { id: '2', username: 'student2', email: 'student2@test.com', role: 'Student' },
        { id: '3', username: 'student3', email: 'student3@test.com', role: 'Student' },
      ],
      teachers: [
        { id: '4', username: 'teacher1', email: 'teacher1@test.com', role: 'Teacher' },
        { id: '5', username: 'teacher2', email: 'teacher2@test.com', role: 'Teacher' },
      ],
    };

    render(<ClasseCard classe={classeWithMorePeople} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
