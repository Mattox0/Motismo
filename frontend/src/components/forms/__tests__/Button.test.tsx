/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '../Button';

describe('Button component', () => {
  it('should render with children text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply primary variant class correctly', () => {
    render(<Button variant="primary">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  it('should apply error variant class correctly', () => {
    render(<Button variant="error">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'btn-error');
  });

  it('should apply other variant with custom class correctly', () => {
    render(
      <Button variant="other" className="custom-class">
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'custom-class');
    expect(button).not.toHaveClass('btn-other');
  });

  it('should render start icon', () => {
    render(
      <Button variant="primary" startIcon={<span data-testid="start-icon">🚀</span>}>
        Button
      </Button>
    );
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('start-icon').parentElement).toHaveClass('btn-icon', 'start');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Button
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Button variant="primary" disabled>
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" onClick={handleClick} disabled>
        Button
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have correct type attribute', () => {
    render(
      <Button variant="primary" type="submit">
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should apply additional className', () => {
    render(
      <Button variant="primary" className="extra-class">
        Button
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'btn-primary', 'extra-class');
  });
});
