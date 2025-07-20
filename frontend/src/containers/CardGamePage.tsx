import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useCard } from '@/providers/CardProvider';
import { IQuizzType } from '@/types/model/IQuizzType';

import { CustomErrorPage } from './CustomErrorPage';

interface ICardGamePageProps {
  cardId: string;
}

export const CardGamePage: FC<ICardGamePageProps> = () => {
  const { quizz, isLoading } = useCard();
  const router = useRouter();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="parent-loader">
        <span className="loader"></span>
      </div>
    );
  }

  if (quizz?.quizzType !== IQuizzType.CARDS) {
    return (
      <CustomErrorPage
        image="/unauthorized.svg"
        title={t('error.unauthorized.quizz')}
        buttonText={t('error.return.home')}
        onClick={() => router.push('/')}
      />
    );
  }

  return <div></div>;
};
