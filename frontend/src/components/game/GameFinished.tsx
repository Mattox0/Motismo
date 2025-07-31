import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';
import { FC } from 'react';

import { useGame } from '@/providers/GameProvider';
import { IRankingStatistics } from '@/types/model/IRanking';

interface IGameFinishedProps {
  statistics: IRankingStatistics;
}

export const GameFinished: FC<IGameFinishedProps> = ({ statistics }) => {
  const { myUser } = useGame();
  const winner = statistics.ranking[0];
  const myRank = statistics.ranking.find(player => player.id === myUser?.id);

  return (
    <div className="game-finished">
      <motion.div
        className="game-finished__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="game-finished__header">
          <motion.h1
            className="game-finished__title"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            Partie terminée !
          </motion.h1>
        </div>

        <motion.div
          className="game-finished__winner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <EmojiEventsIcon
            className="winner-trophy"
            style={{ fontSize: '4rem', color: '#FFD700' }}
          />
          <h2 className="winner-title">Vainqueur</h2>
          <div className="winner-name">{winner.name}</div>
          <div className="winner-points">{winner.points} points</div>
        </motion.div>

        {myUser && myUser.id !== winner.id && myRank && (
          <motion.div
            className="game-finished__your-rank"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3>Votre classement</h3>
            <div className="your-rank-position">
              {myRank.rank}
              <span className="rank-suffix">
                {myRank.rank === 1
                  ? 'er'
                  : myRank.rank === 2
                    ? 'ème'
                    : myRank.rank === 3
                      ? 'ème'
                      : 'ème'}
              </span>
            </div>
            <div className="your-rank-points">{myRank.points} points</div>
          </motion.div>
        )}

        <motion.div
          className="game-finished__stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="stats-item">
            <div className="stats-value">{statistics.totalPlayers}</div>
            <div className="stats-label">Joueurs</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
