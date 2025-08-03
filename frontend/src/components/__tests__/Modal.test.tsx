/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';

import { Modal } from '../Modal';

describe('Modal component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(<Modal {...defaultProps} />);

    const modal = screen.getByText('Test Modal').closest('.modal');
    fireEvent.click(modal!);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should have correct CSS classes', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal').closest('.modal-overlay')).toBeInTheDocument();
    expect(screen.getByText('Test Modal').closest('.modal')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toHaveClass('modal__title');
    expect(screen.getByText('×')).toHaveClass('modal__close');
    expect(screen.getByText('Modal content').closest('.modal__content')).toBeInTheDocument();
  });
});
