'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import QuestionForm, { QuestionFormData } from '@/components/forms/QuestionForm';
import { SplashScreen } from '@/components/SplashScreen';
import { useQuizz } from '@/providers/QuizzProvider';
import { useDeleteQuestionMutation, useUpdateQuestionMutation } from '@/services/question.service';
import { showToast } from '@/utils/toast';

import { CustomErrorPage } from './CustomErrorPage';
import { QuestionSide } from './QuestionSide';

interface IQuizzPageProps {
  quizzId: string;
}

export const QuizzPage: FC<IQuizzPageProps> = ({ quizzId }) => {
  const { t } = useTranslation();
  const { isLoading, isAuthor, currentQuestion, setCurrentQuestion } = useQuizz();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  const submit = async (data: QuestionFormData) => {
    if (!currentQuestion) {
      return;
    }
    try {
      const form = new FormData();
      if (data.title) {
        form.append('title', data.title);
      }
      if (data.questionType) {
        form.append('questionType', data.questionType);
      }
      if (data.image) {
        form.append('image', data.image);
      }
      if (data.choices) {
        form.append('choices', JSON.stringify(data.choices));
      }
      const response = await updateQuestion({
        quizzId,
        questionId: currentQuestion?.id,
        question: form,
      });
      if (response.error) {
        throw new Error();
      }
      showToast.success(t('question.updateSuccess'));
    } catch (error) {
      console.error('Error updating question:', error);
      showToast.error(t('question.updateError'));
    }
  };

  const onDelete = async () => {
    if (!currentQuestion) {
      return;
    }
    setCurrentQuestion(null);
    await deleteQuestion({ quizzId: quizzId, questionId: currentQuestion?.id });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthor) {
    return (
      <CustomErrorPage
        image="/unauthorized.svg"
        title={t('error.unauthorized.quizz')}
        buttonText={t('error.return.home')}
        onClick={() => router.push('/')}
      />
    );
  }

  return (
    <div className="quizz-page">
      <button
        className="quizz-page__mobile-toggle"
        onClick={toggleMobileSidebar}
        aria-label={t('quiz.toggleSidebar')}
      >
        <MenuIcon />
      </button>

      {isMobileSidebarOpen && (
        <div className="quizz-page__mobile-overlay" onClick={toggleMobileSidebar} />
      )}

      <QuestionSide
        quizzId={quizzId}
        onCloseMobile={toggleMobileSidebar}
        isMobileOpen={isMobileSidebarOpen}
      />

      <QuestionForm onSubmit={submit} onDelete={onDelete} />
    </div>
  );
};
