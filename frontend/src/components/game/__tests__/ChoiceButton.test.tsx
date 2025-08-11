import { render, screen, fireEvent } from '@testing-library/react';

import { ChoiceButton } from '../ChoiceButton';

describe('ChoiceButton', () => {
  const defaultProps = {
    choice: { text: 'Test Choice' },
    index: 0,
    isSelected: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render choice text', () => {
    render(<ChoiceButton {...defaultProps} />);

    expect(screen.getByText('Test Choice')).toBeInTheDocument();
  });

  it('should call onClick with index when clicked', () => {
    const onClick = jest.fn();
    render(<ChoiceButton {...defaultProps} onClick={onClick} />);

    fireEvent.click(screen.getByText('Test Choice'));

    expect(onClick).toHaveBeenCalledWith(0);
  });

  it('should have selected class when isSelected is true', () => {
    render(<ChoiceButton {...defaultProps} isSelected={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('choice-btn--selected');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ChoiceButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render checkbox for multiple choice', () => {
    render(<ChoiceButton {...defaultProps} isMultipleChoice={true} />);

    expect(screen.getByText('□')).toBeInTheDocument();
  });

  it('should render checked checkbox when selected in multiple choice', () => {
    render(<ChoiceButton {...defaultProps} isMultipleChoice={true} isSelected={true} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
