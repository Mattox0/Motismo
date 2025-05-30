'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuizz } from '@/providers/QuizzProvider';

import { CustomErrorPage } from './CustomErrorPage';
import { QuestionSide } from './QuestionSide';

interface QuizzPageProps {
  quizzId: string;
}

export const QuizzPage: FC<QuizzPageProps> = ({ quizzId }) => {
  const { t } = useTranslation();
  const { isLoading, isAuthor } = useQuizz();
  const router = useRouter();

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
    </div>
  );
};
