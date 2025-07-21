import DeleteIcon from '@mui/icons-material/Delete';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuizz } from '@/providers/QuizzProvider';
import { IQuestion } from '@/types/model/IQuestion';

interface IQuestionItemProps {
  question: IQuestion;
  active: boolean;
  onDelete?: (_questionId: string) => void;
}

export const QuestionItem: FC<IQuestionItemProps> = ({ question, active, onDelete }) => {
  const { t } = useTranslation();
  const { selectCurrentQuestion } = useQuizz();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(question.id);
  };

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
      <div className="question-item__trash" onClick={handleDelete}>
        <DeleteIcon />
      </div>
    </div>
  );
};
