'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
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
      <QuestionSide quizzId={quizzId} />
      <QuestionForm onSubmit={submit} onDelete={onDelete} />
    </div>
  );
};
