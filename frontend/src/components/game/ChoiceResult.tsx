import { motion } from 'framer-motion';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useGame } from '@/providers/GameProvider';
import { IChoiceStatistic } from '@/types/model/IAnswerStatistics';

import { Avatar } from './Avatar';

interface IChoiceResultProps {
  choice: IChoiceStatistic;
  index: number;
}

export const ChoiceResult: FC<IChoiceResultProps> = ({ choice, index }) => {
  const { t } = useTranslation();
  const { myUser } = useGame();

  return (
    <motion.div
      className={`choice-result ${choice.isCorrect ? 'choice-result--correct' : 'choice-result--incorrect'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="choice-result__header">
        <div className="choice-result__label">
          <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
          <span className="choice-text">{choice.choiceText}</span>
          {choice.isCorrect && <span className="choice-correct-badge">✓</span>}
        </div>
        <div className="choice-result__stats">
          <span className="choice-count">{choice.count}</span>
          <span className="choice-percentage">{choice.percentage}%</span>
        </div>
      </div>

      <div className="choice-result__bar">
        <motion.div
          className="choice-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${choice.percentage}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {choice.users.length > 0 && (
        <div className="choice-result__users">
          <div className="users-label">{t('game.player.answeredBy')}</div>
          <div className="users-list">
            {choice.users.map(user => {
              const isCurrentUser = myUser?.id === user.id;

              return (
                <motion.div
                  key={user.id}
                  className={`user-chip ${isCurrentUser ? 'user-chip--current' : ''}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 + choice.users.indexOf(user) * 0.05 }}
                >
                  <Avatar avatar={user.avatar || ''} mode={isCurrentUser ? 'current' : 'other'} />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
