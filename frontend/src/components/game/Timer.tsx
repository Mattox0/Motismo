import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlagIcon from '@mui/icons-material/Flag';
import { FC } from 'react';

interface ITimerProps {
  timeLeft: number;
  answerCount?: { answered: number; total: number };
  isFinished?: boolean;
  isPresenter?: boolean;
  onFinishedClick?: () => void;
  className?: string;
}

export const Timer: FC<ITimerProps> = ({
  timeLeft,
  answerCount = { answered: 0, total: 0 },
  isFinished = false,
  isPresenter = false,
  onFinishedClick,
  className = '',
}) => {
  const formatTime = (time: number) => {
    return Math.ceil(time / 1000);
  };

  if (isFinished) {
    return (
      <div className={`question-timer finished ${className}`}>
        <div className="answer-count">
          {answerCount.answered}/{answerCount.total}
        </div>
        <div
          className="timer-circle finished-state"
          onClick={onFinishedClick}
          style={{ cursor: onFinishedClick ? 'pointer' : 'default' }}
        >
          {isPresenter ? (
            <ArrowForwardIcon className="timer-icon" />
          ) : (
            <FlagIcon className="timer-icon" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`question-timer ${className}`}>
      <div className="answer-count">
        {answerCount.answered}/{answerCount.total}
      </div>
      <div className="timer-circle">
        <span className="timer-text">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};
