import { render, screen, fireEvent } from '@testing-library/react';

import { CallToAction } from '../CallToAction';

describe('CallToAction', () => {
  const defaultProps = {
    icon: <span data-testid="icon">🚀</span>,
    title: 'Test Title',
    description: 'Test Description',
    button: <button data-testid="button">Click me</button>,
    variant: 'primary' as const,
  };

  it('should render with all required props', () => {
    render(<CallToAction {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should render as form when input and onSubmit are provided', () => {
    const onSubmit = jest.fn();
    const input = <input data-testid="input" />;

    render(<CallToAction {...defaultProps} input={input} onSubmit={onSubmit} />);

    const form = screen.getByTestId('input').closest('form');
    expect(form).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', () => {
    const onSubmit = jest.fn();
    const input = <input data-testid="input" />;

    render(<CallToAction {...defaultProps} input={input} onSubmit={onSubmit} />);

    const form = screen.getByTestId('input').closest('form');
    fireEvent.submit(form!);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should render as div when no input or onSubmit provided', () => {
    render(<CallToAction {...defaultProps} />);

    const container = screen.getByText('Test Title').closest('.cta-container');
    expect(container).toHaveClass('cta-container', 'primary');
  });
});
