/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import Divider from '../Divider';

describe('Divider component', () => {
  it('should render with provided text', () => {
    render(<Divider text="Ou continuer avec" />);
    expect(screen.getByText('Ou continuer avec')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(<Divider text="Test text" />);

    const divider = screen.getByText('Test text').closest('.auth-divider');
    expect(divider).toBeInTheDocument();

    const textSpan = screen.getByText('Test text');
    expect(textSpan).toHaveClass('divider-text');
  });

  it('should render with different text content', () => {
    render(<Divider text="Alternative text" />);
    expect(screen.getByText('Alternative text')).toBeInTheDocument();
  });

  it('should render with empty text', () => {
    render(<Divider text="" />);
    const textSpan = screen.getByText('', { selector: '.divider-text' });
    expect(textSpan).toBeInTheDocument();
    expect(textSpan).toHaveTextContent('');
  });
});
