/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Input from '../Input';

jest.mock('@mui/icons-material/VisibilityRounded', () => {
  return function MockVisibilityIcon() {
    return <div data-testid="visibility-icon" />;
  };
});

jest.mock('@mui/icons-material/VisibilityOffRounded', () => {
  return function MockVisibilityOffIcon() {
    return <div data-testid="visibility-off-icon" />;
  };
});

describe('Input component', () => {
  const defaultProps = {
    label: 'Test Input',
    id: 'test-input',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    render(<Input {...defaultProps} />);

    expect(screen.getByText('Test Input')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('should render without label', () => {
    render(<Input id="test-input" />);

    expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(<Input {...defaultProps} error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('input-error-text');
  });

  it('should render with helper text', () => {
    render(<Input {...defaultProps} helperText="This is helpful information" />);

    expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    expect(screen.getByText('This is helpful information')).toHaveClass('input-help-text');
  });

  it('should render with start adornment', () => {
    render(<Input {...defaultProps} startAdornment={<span data-testid="start-icon">🔍</span>} />);

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('has-start-icon');
  });

  it('should render with end adornment', () => {
    render(<Input {...defaultProps} endAdornment={<span data-testid="end-icon">✓</span>} />);

    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('has-end-icon');
  });

  it('should apply error styles when error is present', () => {
    render(<Input {...defaultProps} error="Error message" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should apply custom className', () => {
    render(<Input {...defaultProps} className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should set autoComplete attribute', () => {
    render(<Input {...defaultProps} autoComplete="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('should generate unique id when not provided', () => {
    render(<Input label="Test Label" />);

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('id');
    expect(input.getAttribute('id')).toMatch(/^input-test-label-/);
  });

  it('should handle registration props from react-hook-form', () => {
    const mockRegistration = {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      name: 'testField',
      ref: jest.fn(),
    };

    render(<Input {...defaultProps} registration={mockRegistration} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'testField');
  });

  it('should not render end adornment when isPassword is true', () => {
    render(
      <Input {...defaultProps} isPassword endAdornment={<span data-testid="end-icon">✓</span>} />
    );

    expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('visibility-off-icon')).toBeInTheDocument();
  });

  it('should handle input change events', () => {
    const handleChange = jest.fn();
    render(<Input {...defaultProps} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalled();
  });
});
