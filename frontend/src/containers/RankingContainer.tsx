import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FC } from 'react';

import { Ranking } from '@/components/game/Ranking';
import { IRankingStatistics } from '@/types/model/IRanking';

interface IRankingContainerProps {
  statistics: IRankingStatistics;
  handleClick: () => void;
}

export const RankingContainer: FC<IRankingContainerProps> = ({ statistics, handleClick }) => {
  return (
    <div className="ranking-container">
      <Ranking statistics={statistics} />

      <div className="next-button">
        <div className="next-button__circle" onClick={handleClick}>
          <ArrowForwardIcon className="next-button__icon" />
        </div>
      </div>
    </div>
  );
};
