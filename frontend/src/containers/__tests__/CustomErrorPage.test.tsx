import { fireEvent, render, screen } from '@testing-library/react';

import { CustomErrorPage } from '../CustomErrorPage';

describe('CustomErrorPage', () => {
  const mockOnClick = jest.fn();

  const renderComponent = (props = {}) => {
    const defaultProps = {
      title: 'Error Title',
      description: 'Error Description',
      buttonText: 'Retry',
      onClick: mockOnClick,
      ...props,
    };

    return render(<CustomErrorPage {...defaultProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the error title', () => {
    renderComponent();

    expect(screen.getByText('Error Title')).toBeInTheDocument();
  });

  it('should render the error description', () => {
    renderComponent();

    expect(screen.getByText('Error Description')).toBeInTheDocument();
  });

  it('should render the button with correct text', () => {
    renderComponent();

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', () => {
    renderComponent();

    const button = screen.getByText('Retry');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render image when provided', () => {
    renderComponent({ image: 'error-image.jpg' });

    const image = screen.getByAltText('Error Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'error-image.jpg');
  });

  it('should not render image when not provided', () => {
    renderComponent({ image: undefined });

    expect(screen.queryByAltText('Error Title')).not.toBeInTheDocument();
  });

  it('should not render button when onClick is not provided', () => {
    renderComponent({ onClick: undefined });

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should not render button when buttonText is not provided', () => {
    renderComponent({ buttonText: undefined });

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    renderComponent();

    const container = document.querySelector('.custom-error-page');
    const title = document.querySelector('.custom-error-page__title');
    const text = document.querySelector('.custom-error-page__text');

    expect(container).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    renderComponent({
      title: 'Custom Error',
      description: 'Custom Description',
      buttonText: 'Custom Button',
    });

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
    expect(screen.getByText('Custom Button')).toBeInTheDocument();
  });
});
