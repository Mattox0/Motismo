import { FC } from 'react';

import { AllQuestion } from '../../../backend/src/question/types/AllQuestion';

interface QuestionItemProps {
  question: AllQuestion;
}

export const QuestionItem: FC<QuestionItemProps> = ({ question }) => {
  return (
    <div className="question-item">
      <div className="question-item__icon">
        <span>{question.order}</span>
      </div>
      <p className="question-item__title">{question.title}</p>
    </div>
  );
};
