/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';

import { showToast } from '@/utils/toast';

import { ColorPicker } from '../ColorPicker';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/utils/toast', () => ({
  showToast: {
    error: jest.fn(),
  },
}));

jest.mock('../Input', () => {
  return function MockInput({ value, onChange, onBlur, onKeyDown, placeholder }: any) {
    return (
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        data-testid="hex-input"
      />
    );
  };
});

describe('ColorPicker component', () => {
  const defaultProps = {
    setColor: jest.fn(),
    color: '#f44336',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render palette and custom mode buttons', () => {
    render(<ColorPicker {...defaultProps} />);

    expect(screen.getByText('Palette')).toBeInTheDocument();
    expect(screen.getByText('Personnalisée')).toBeInTheDocument();
  });

  it('should render color palette buttons', () => {
    render(<ColorPicker {...defaultProps} />);

    const colorButtons = screen
      .getAllByRole('button')
      .filter(button => button.style.backgroundColor);
    expect(colorButtons).toHaveLength(16);
  });

  it('should switch to custom mode when custom button is clicked', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    expect(customButton).toHaveClass('font-bold', 'border-b-2');
    expect(screen.getByText('Palette')).not.toHaveClass('font-bold', 'border-b-2');
  });

  it('should show hex input in custom mode', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    expect(screen.getByTestId('hex-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('#RRGGBB')).toBeInTheDocument();
  });

  it('should apply valid hex color on blur', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    const hexInput = screen.getByTestId('hex-input');
    fireEvent.change(hexInput, { target: { value: 'FF0000' } });
    fireEvent.blur(hexInput);

    expect(defaultProps.setColor).toHaveBeenCalledWith('#FF0000');
  });

  it('should apply valid hex color with # prefix', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    const hexInput = screen.getByTestId('hex-input');
    fireEvent.change(hexInput, { target: { value: '#00FF00' } });
    fireEvent.blur(hexInput);

    expect(defaultProps.setColor).toHaveBeenCalledWith('#00FF00');
  });

  it('should show error for invalid hex color', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    const hexInput = screen.getByTestId('hex-input');
    fireEvent.change(hexInput, { target: { value: 'invalid' } });
    fireEvent.blur(hexInput);

    expect(showToast.error).toHaveBeenCalledWith('error.hex_invalid');
  });

  it('should apply hex color on Enter key', () => {
    render(<ColorPicker {...defaultProps} />);

    const customButton = screen.getByText('Personnalisée');
    fireEvent.click(customButton);

    const hexInput = screen.getByTestId('hex-input');
    fireEvent.change(hexInput, { target: { value: '0000FF' } });
    fireEvent.keyDown(hexInput, { key: 'Enter' });

    expect(defaultProps.setColor).toHaveBeenCalledWith('#0000FF');
  });

  it('should update hex input when palette color is selected', () => {
    render(<ColorPicker {...defaultProps} />);

    const colorButtons = screen
      .getAllByRole('button')
      .filter(button => button.style.backgroundColor);

    fireEvent.click(colorButtons[2]);

    expect(defaultProps.setColor).toHaveBeenCalledWith('#9c27b0');
  });
});
