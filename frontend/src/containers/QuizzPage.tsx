'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import QuestionForm, { QuestionFormData } from '@/components/forms/QuestionForm';
import { useQuizz } from '@/providers/QuizzProvider';
import { useUpdateQuestionMutation } from '@/services/question.service';
import { showToast } from '@/utils/toast';

import { CustomErrorPage } from './CustomErrorPage';
import { QuestionSide } from './QuestionSide';

interface QuizzPageProps {
  quizzId: string;
}

export const QuizzPage: FC<QuizzPageProps> = ({ quizzId }) => {
  const { t } = useTranslation();
  const { isLoading, isAuthor, currentQuestion } = useQuizz();
  const [updateQuestion] = useUpdateQuestionMutation();
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
      console.log('Update question response:', response);
      showToast.success(t('question.updateSuccess'));
    } catch (error) {
      console.error('Error updating question:', error);
      showToast.error(t('question.updateError'));
    }
  };

  if (isLoading) {
    return (
      <div className="parent-loader">
        <span className="loader"></span>
      </div>
    );
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
      <QuestionForm onSubmit={submit} />
    </div>
  );
};
