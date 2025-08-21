import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { IClasse } from '@/types/model/IClasse';

import { ClasseHeader } from '../ClasseHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockClasse: IClasse = {
  id: '1',
  name: 'Test Class',
  code: 'TEST123',
  students: [],
  teachers: [],
};

describe('ClasseHeader', () => {
  it('renders classe name and code correctly', () => {
    const mockBackClick = jest.fn();
    render(<ClasseHeader classe={mockClasse} onBackClick={mockBackClick} />);

    expect(screen.getByText('Test Class')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText('classe.code:')).toBeInTheDocument();
  });

  it('calls onBackClick when back button is clicked', () => {
    const mockBackClick = jest.fn();
    render(<ClasseHeader classe={mockClasse} onBackClick={mockBackClick} />);

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockBackClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different classe data', () => {
    const differentClasse: IClasse = {
      id: '2',
      name: 'Another Class',
      code: 'ABC456',
      students: [],
      teachers: [],
    };

    const mockBackClick = jest.fn();
    render(<ClasseHeader classe={differentClasse} onBackClick={mockBackClick} />);

    expect(screen.getByText('Another Class')).toBeInTheDocument();
    expect(screen.getByText('ABC456')).toBeInTheDocument();
  });
});
