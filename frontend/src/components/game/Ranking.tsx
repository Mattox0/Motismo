import BoltIcon from '@mui/icons-material/Bolt';
import { motion, AnimatePresence } from 'framer-motion';
import { FC, useState, useEffect } from 'react';

import { useGame } from '@/providers/GameProvider';
import { IRankingPlayer, IRankingStatistics } from '@/types/model/IRanking';

import { Avatar } from './Avatar';

interface IRankingProps {
  statistics: IRankingStatistics;
}

export const Ranking: FC<IRankingProps> = ({ statistics }) => {
  const { myUser } = useGame();
  const [animatedRanking, setAnimatedRanking] = useState<IRankingPlayer[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRanking(statistics.ranking);
    }, 300);

    return () => clearTimeout(timer);
  }, [statistics.ranking]);

  return (
    <div className="ranking">
      <div className="ranking__container">
        <div className="ranking__header">
          <motion.h1
            className="ranking__title"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Classement
          </motion.h1>
          <motion.p
            className="ranking__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {statistics.totalPlayers} joueur{statistics.totalPlayers > 1 ? 's' : ''}
          </motion.p>
        </div>

        <div className="ranking__list-container">
          <div className="ranking-list">
            <AnimatePresence>
              {animatedRanking.map((player, index) => {
                const isCurrentUser = myUser?.id === player.id;

                return (
                  <motion.div
                    key={player.id}
                    className={`ranking-item ${isCurrentUser ? 'ranking-item--current' : ''}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: isCurrentUser
                        ? 'rgba(255, 193, 7, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)',
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="ranking-item__rank">
                      <span className="rank-number">{player.rank}</span>
                    </div>
                    <div className="ranking-item__player">
                      <Avatar
                        avatar={player.avatar}
                        name={player.name}
                        mode={isCurrentUser ? 'current' : 'other'}
                      />
                      <div className="player-info">
                        <span className="player-name">{player.name}</span>
                        {player.isFastest && <BoltIcon className="player-icon" />}
                      </div>
                    </div>
                    <motion.div
                      className="ranking-item__points"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    >
                      <div className="points-total">{player.points} pts</div>
                      {player.roundPoints > 0 && (
                        <div className="points-round">+{player.roundPoints} pts</div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
