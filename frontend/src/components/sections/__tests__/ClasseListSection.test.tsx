import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { IClasse } from '@/types/model/IClasse';

import { ClasseListSection } from '../ClasseListSection';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockClasses: IClasse[] = [
  {
    id: '1',
    name: 'Class 1',
    code: 'ABC123',
    students: [],
    teachers: [],
  },
  {
    id: '2',
    name: 'Class 2',
    code: 'DEF456',
    students: [],
    teachers: [],
  },
];

describe('ClasseListSection', () => {
  it('renders loading state when isLoading is true', () => {
    render(<ClasseListSection classes={[]} isLoading={true} />);

    const loader = document.querySelector('.parent-loader');
    expect(loader).toBeInTheDocument();
  });

  it('renders empty state when no classes are provided', () => {
    render(<ClasseListSection classes={[]} isLoading={false} />);

    expect(screen.getByText('classe.noClasses')).toBeInTheDocument();
    expect(screen.getByText('classe.noClassesDescription')).toBeInTheDocument();
  });

  it('renders classes list when classes are provided', () => {
    render(<ClasseListSection classes={mockClasses} isLoading={false} />);

    expect(screen.getByText('Class 1')).toBeInTheDocument();
    expect(screen.getByText('Class 2')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('DEF456')).toBeInTheDocument();
  });

  it('calls onEditClasse when edit button is clicked', () => {
    const mockEditClasse = jest.fn();
    render(
      <ClasseListSection classes={mockClasses} isLoading={false} onEditClasse={mockEditClasse} />
    );

    const editButtons = screen.getAllByText('classe.edit');
    fireEvent.click(editButtons[0]);

    expect(mockEditClasse).toHaveBeenCalledWith(mockClasses[0]);
  });

  it('calls onViewClasse when view button is clicked', () => {
    const mockViewClasse = jest.fn();
    render(
      <ClasseListSection classes={mockClasses} isLoading={false} onViewClasse={mockViewClasse} />
    );

    const viewButtons = screen.getAllByText('classe.view');
    fireEvent.click(viewButtons[0]);

    expect(mockViewClasse).toHaveBeenCalledWith(mockClasses[0]);
  });

  it('calls onDeleteClasse when delete button is clicked', () => {
    const mockDeleteClasse = jest.fn();
    render(
      <ClasseListSection
        classes={mockClasses}
        isLoading={false}
        onDeleteClasse={mockDeleteClasse}
      />
    );

    const deleteButtons = screen.getAllByText('classe.delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteClasse).toHaveBeenCalledWith(mockClasses[0]);
  });

  it('renders without action handlers', () => {
    render(<ClasseListSection classes={mockClasses} isLoading={false} />);

    expect(screen.getByText('Class 1')).toBeInTheDocument();
    expect(screen.getByText('Class 2')).toBeInTheDocument();
    expect(screen.queryByText('classe.edit')).not.toBeInTheDocument();
    expect(screen.queryByText('classe.view')).not.toBeInTheDocument();
    expect(screen.queryByText('classe.delete')).not.toBeInTheDocument();
  });

  it('renders single class correctly', () => {
    const singleClass = [mockClasses[0]];
    render(<ClasseListSection classes={singleClass} isLoading={false} />);

    expect(screen.getByText('Class 1')).toBeInTheDocument();
    expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
  });
});
