import { render, screen, fireEvent } from '@testing-library/react';

import { Timer } from '../Timer';

describe('Timer', () => {
  const defaultProps = {
    timeLeft: 30000,
  };

  it('should render timer with time', () => {
    render(<Timer {...defaultProps} />);

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should render answer count', () => {
    const props = {
      ...defaultProps,
      answerCount: { answered: 5, total: 10 },
    };

    render(<Timer {...props} />);

    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('should render finished state when isFinished is true', () => {
    const props = {
      ...defaultProps,
      isFinished: true,
      answerCount: { answered: 8, total: 10 },
    };

    render(<Timer {...props} />);

    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('should render presenter icon when isPresenter is true and finished', () => {
    const props = {
      ...defaultProps,
      isFinished: true,
      isPresenter: true,
    };

    render(<Timer {...props} />);

    const timerCircle = screen
      .getByText('0/0')
      .closest('.question-timer')
      ?.querySelector('.timer-circle');
    expect(timerCircle).toHaveClass('finished-state');
  });

  it('should render flag icon when not presenter and finished', () => {
    const props = {
      ...defaultProps,
      isFinished: true,
      isPresenter: false,
    };

    render(<Timer {...props} />);

    const timerCircle = screen
      .getByText('0/0')
      .closest('.question-timer')
      ?.querySelector('.timer-circle');
    expect(timerCircle).toHaveClass('finished-state');
  });

  it('should call onFinishedClick when clicked and finished', () => {
    const onFinishedClick = jest.fn();
    const props = {
      ...defaultProps,
      isFinished: true,
      onFinishedClick,
    };

    render(<Timer {...props} />);

    const timerCircle = screen
      .getByText('0/0')
      .closest('.question-timer')
      ?.querySelector('.timer-circle');
    fireEvent.click(timerCircle!);

    expect(onFinishedClick).toHaveBeenCalled();
  });

  it('should have correct CSS classes', () => {
    render(<Timer {...defaultProps} />);

    const container = screen.getByText('30').closest('.question-timer');
    expect(container).toHaveClass('question-timer');
  });

  it('should have finished class when isFinished is true', () => {
    const props = {
      ...defaultProps,
      isFinished: true,
    };

    render(<Timer {...props} />);

    const container = screen.getByText('0/0').closest('.question-timer');
    expect(container).toHaveClass('finished');
  });

  it('should format time correctly', () => {
    const props = {
      timeLeft: 15000,
    };

    render(<Timer {...props} />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
