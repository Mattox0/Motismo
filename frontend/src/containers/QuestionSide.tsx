import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { QuestionItem } from '@/components/QuestionItem';
import { initializeQuestion } from '@/core/initializeQuestion';
import { useQuizz } from '@/providers/QuizzProvider';
import { useAddQuestionMutation, useDeleteQuestionMutation } from '@/services/question.service';
import { useCreateGameMutation } from '@/services/quiz.service';
import { showToast } from '@/utils/toast';

interface IQuestionSideProps {
  quizzId: string;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
}

export const QuestionSide: FC<IQuestionSideProps> = ({ quizzId, onCloseMobile, isMobileOpen }) => {
  const { t } = useTranslation();
  const { quizz, currentQuestion } = useQuizz();
  const [addQuestion] = useAddQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [createGame] = useCreateGameMutation();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleAddQuestion = async () => {
    try {
      const formData = initializeQuestion();
      await addQuestion({ quizzId, question: formData });
      showToast.success(t('question.addSuccess'));
    } catch {
      showToast.error(t('question.addError'));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion({ quizzId, questionId });
  };

  const handleLaunchQuiz = async () => {
    if (!quizz?.questions || quizz.questions.length === 0) {
      showToast.error(t('quiz.launch.noQuestions'));
      return;
    }

    setIsLaunching(true);
    try {
      const response = await createGame(quizzId);
      if ('data' in response && response.data) {
        const gameCode = response.data.code;
        showToast.success(t('quiz.launch.success'));
        window.open(`/game/${gameCode}`, '_blank');
      } else {
        throw new Error('Failed to create game');
      }
    } catch {
      showToast.error(t('quiz.launch.error'));
    } finally {
      setIsLaunching(false);
    }
  };

  const canLaunchQuiz = quizz && quizz.questions && quizz.questions.length > 0;

  return (
    <div className={`question-side ${isMobileOpen ? 'question-side--mobile-open' : ''}`}>
      {onCloseMobile && (
        <button
          className="question-side__mobile-close-btn"
          onClick={onCloseMobile}
          aria-label={t('quiz.closeSidebar')}
        >
          <CloseIcon />
        </button>
      )}

      <div className="question-side__content">
        <div className="question-side__questions">
          {quizz?.questions && quizz.questions.length > 0 ? (
            quizz.questions.map(item => (
              <QuestionItem
                key={item.id}
                question={item}
                active={currentQuestion?.id === item.id}
                onDelete={handleDeleteQuestion}
              />
            ))
          ) : (
            <div className="question-side__empty">
              <QuizIcon className="question-side__empty-icon" />
              <p>{t('quiz.noQuestions')}</p>
              <span>{t('quiz.noQuestionsDesc')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="question-side__actions">
        <Button
          variant="secondary"
          onClick={handleAddQuestion}
          startIcon={<AddIcon />}
          className="question-side__add-btn"
        >
          {t('edit_quiz.add.question')}
        </Button>

        <Button
          variant="other"
          onClick={handleLaunchQuiz}
          startIcon={<PlayArrowIcon />}
          disabled={!canLaunchQuiz || isLaunching}
          className="question-side__launch-btn"
        >
          {isLaunching ? t('quiz.launching') : t('quiz.launchButton')}
        </Button>
      </div>
    </div>
  );
};
