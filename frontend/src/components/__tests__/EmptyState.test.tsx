/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import { EmptyState } from '../EmptyState';

describe('EmptyState component', () => {
  const defaultProps = {
    title: 'Aucun élément trouvé',
    description: "Il n'y a rien à afficher pour le moment",
  };

  it('should render title and description', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('Aucun élément trouvé')).toBeInTheDocument();
    expect(screen.getByText("Il n'y a rien à afficher pour le moment")).toBeInTheDocument();
  });

  it('should render image with correct attributes', () => {
    render(<EmptyState {...defaultProps} />);

    const image = screen.getByAltText('État vide');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/empty_state_quizz.svg');
    expect(image).toHaveAttribute('width', '200');
    expect(image).toHaveAttribute('height', '200');
  });

  it('should have correct CSS classes', () => {
    render(<EmptyState {...defaultProps} />);

    const container = screen.getByText('Aucun élément trouvé').closest('.empty-state');
    expect(container).toBeInTheDocument();

    const title = screen.getByText('Aucun élément trouvé');
    expect(title).toHaveClass('empty-state__title');

    const description = screen.getByText("Il n'y a rien à afficher pour le moment");
    expect(description).toHaveClass('empty-state__description');
  });

  it('should render with different title and description', () => {
    render(
      <EmptyState
        title="Aucune carte disponible"
        description="Créez votre première carte pour commencer"
      />
    );

    expect(screen.getByText('Aucune carte disponible')).toBeInTheDocument();
    expect(screen.getByText('Créez votre première carte pour commencer')).toBeInTheDocument();
  });
});
