import AddIcon from '@mui/icons-material/Add';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { QuestionItem } from '@/components/QuestionItem';
import { useGetQuestionsQuery } from '@/services/question.service';

interface QuestionSideProps {
  quizzId: string;
}

export const QuestionSide: FC<QuestionSideProps> = ({ quizzId }) => {
  const { t } = useTranslation();
  const { data: allQuestions } = useGetQuestionsQuery(quizzId);

  const handleAddQuestion = () => {
    console.log('add question');
  };

  return (
    <div className="question-side">
      {allQuestions?.map(item => <QuestionItem question={item} />)}
      <div className="question-side__buttons">
        <Button variant="primary" onClick={handleAddQuestion} startIcon={<AddIcon />}>
          {t('edit_quiz.add.question')}
        </Button>
      </div>
    </div>
  );
};
