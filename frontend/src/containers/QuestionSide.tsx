import AddIcon from '@mui/icons-material/Add';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { QuestionItem } from '@/components/QuestionItem';
import { initializeQuestion } from '@/core/initializeQuestion';
import { useQuizz } from '@/providers/QuizzProvider';
import { useAddQuestionMutation, useDeleteQuestionMutation } from '@/services/question.service';

interface IQuestionSideProps {
  quizzId: string;
}

export const QuestionSide: FC<IQuestionSideProps> = ({ quizzId }) => {
  const { t } = useTranslation();
  const { quizz, currentQuestion } = useQuizz();
  const [addQuestion] = useAddQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const handleAddQuestion = async () => {
    const formData = initializeQuestion();
    await addQuestion({ quizzId, question: formData });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion({ quizzId, questionId });
  };

  return (
    <div className="question-side">
      {quizz?.questions?.map(item => (
        <QuestionItem
          key={crypto.randomUUID()}
          question={item}
          active={currentQuestion?.id === item.id}
          onDelete={handleDeleteQuestion}
        />
      ))}
      <div className="question-side__buttons">
        <Button variant="primary" onClick={handleAddQuestion} startIcon={<AddIcon />}>
          {t('edit_quiz.add.question')}
        </Button>
      </div>
    </div>
  );
};
