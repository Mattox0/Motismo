import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FC } from 'react';

import { AnswerResults } from '@/components/game/AnswerResults';
import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';

interface IAnswerResultsContainerProps {
  statistics: IAnswerStatistics;
  handleClick: () => void;
}

export const AnswerResultsContainer: FC<IAnswerResultsContainerProps> = ({
  statistics,
  handleClick,
}) => {
  return (
    <div className="answer-results-container">
      <AnswerResults statistics={statistics} />

      <div className="next-button">
        <div className="next-button__circle" onClick={handleClick}>
          <ArrowForwardIcon className="next-button__icon" />
        </div>
      </div>
    </div>
  );
};
