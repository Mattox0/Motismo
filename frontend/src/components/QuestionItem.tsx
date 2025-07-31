import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudIcon from '@mui/icons-material/Cloud';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuizz } from '@/providers/QuizzProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IQuestionType } from '@/types/QuestionType';

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

  const getQuestionTypeIcon = (questionType: IQuestionType) => {
    switch (questionType) {
      case IQuestionType.MULTIPLE_CHOICES:
        return <CheckBoxIcon style={{ width: '16px', height: '16px' }} />;
      case IQuestionType.UNIQUE_CHOICES:
        return <RadioButtonCheckedIcon style={{ width: '16px', height: '16px' }} />;
      case IQuestionType.BOOLEAN_CHOICES:
        return <CheckCircleIcon style={{ width: '16px', height: '16px' }} />;
      case IQuestionType.WORD_CLOUD:
        return <CloudIcon style={{ width: '16px', height: '16px' }} />;
      case IQuestionType.MATCHING:
        return <CompareArrowsIcon style={{ width: '16px', height: '16px' }} />;
      default:
        return <CheckBoxIcon style={{ width: '16px', height: '16px' }} />;
    }
  };

  const getQuestionTypeLabel = (questionType: IQuestionType) => {
    switch (questionType) {
      case IQuestionType.MULTIPLE_CHOICES:
        return t('question.types.multipleChoices');
      case IQuestionType.UNIQUE_CHOICES:
        return t('question.types.uniqueChoice');
      case IQuestionType.BOOLEAN_CHOICES:
        return t('question.types.boolean');
      case IQuestionType.WORD_CLOUD:
        return t('question.types.wordCloud');
      case IQuestionType.MATCHING:
        return t('question.types.matching');
      default:
        return t('question.types.multipleChoices');
    }
  };

  return (
    <div
      className={`question-item ${active ? 'question-item--active' : ''}`}
      onClick={() => selectCurrentQuestion(question.id)}
    >
      <div className="question-item__content">
        <div className="question-item__header">
          <div className="question-item__number">{question.order}</div>
          <div className="question-item__type">
            <div className="question-item__type-icon">
              {getQuestionTypeIcon(question.questionType)}
            </div>
            <span className="question-item__type-label">
              {getQuestionTypeLabel(question.questionType)}
            </span>
          </div>
        </div>
        <div className="question-item__body">
          <h4 className="question-item__title">{question.title || t('question.altTitle')}</h4>
          {question.choices && question.choices.length > 0 && (
            <span className="question-item__choices-count">
              {question.choices.length}{' '}
              {t('question.choicesCount', { count: question.choices.length })}
            </span>
          )}
        </div>
      </div>

      <button
        className="question-item__delete"
        onClick={handleDelete}
        aria-label={t('question.delete')}
      >
        <DeleteIcon />
      </button>
    </div>
  );
};
