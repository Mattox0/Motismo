import { render, screen } from '@testing-library/react';
import React from 'react';

import { JoinClasseSection } from '../JoinClasseSection';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('JoinClasseSection', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders join classe section with description', () => {
    render(<JoinClasseSection onSubmit={mockOnSubmit} />);

    expect(screen.getByText('classe.join.description')).toBeInTheDocument();
  });

  it('renders JoinClasseForm component', () => {
    render(<JoinClasseSection onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('classe.join.codeLabel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('classe.join.codePlaceholder')).toBeInTheDocument();
    expect(screen.getByText('classe.join.submit')).toBeInTheDocument();
  });

  it('passes isLoading prop to form', () => {
    render(<JoinClasseSection onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('classe.join.submit')).toBeDisabled();
  });

  it('passes onSubmit prop to form', () => {
    render(<JoinClasseSection onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('classe.join.codeLabel')).toBeInTheDocument();
  });

  it('renders with default isLoading value', () => {
    render(<JoinClasseSection onSubmit={mockOnSubmit} />);

    expect(screen.getByText('classe.join.submit')).not.toBeDisabled();
  });
});
