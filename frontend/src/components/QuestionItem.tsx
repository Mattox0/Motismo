import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuizz } from '@/providers/QuizzProvider';
import { Question } from '@/types/model/Question';

interface QuestionItemProps {
  question: Question;
  active: boolean;
}

export const QuestionItem: FC<QuestionItemProps> = ({ question, active }) => {
  const { t } = useTranslation();
  const { selectCurrentQuestion } = useQuizz();
  return (
    <div
      className={`question-item ${active ? 'active' : ''}`}
      onClick={() => selectCurrentQuestion(question.id)}
    >
      <div className="question-item__icon">
        <span>{question.order + 1}</span>
      </div>
      <p className="question-item__title">
        {question.title ? question.title : t('question.altTitle')}
      </p>
    </div>
  );
};
