import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';

import { ChoiceResult } from './ChoiceResult';

interface IAnswerResultsProps {
  statistics: IAnswerStatistics;
}

export const AnswerResults: FC<IAnswerResultsProps> = ({ statistics }) => {
  const { t } = useTranslation();
  const { questionTitle, totalResponses, choices } = statistics;

  return (
    <div className="answer-results">
      <div className="answer-results__header">
        <h1 className="answer-results__title">{questionTitle}</h1>
        <div className="answer-results__summary">
          <span className="summary-badge">
            {totalResponses} {t('game.player.responses', { count: totalResponses })}
          </span>
        </div>
      </div>

      <div className="answer-results__choices">
        {choices.map((choice, index) => (
          <ChoiceResult key={choice.choiceId} choice={choice} index={index} />
        ))}
      </div>
    </div>
  );
};
