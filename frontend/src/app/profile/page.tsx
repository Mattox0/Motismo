'use client';

import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { AskCreateSection } from '@/components/sections/AskCreateSection';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { useGetQuizQuery } from '@/services/quiz.service';
import { IQuizzType } from '@/types/IQuizzType';

import { Quizz } from '../../../../backend/src/quizz/quizz.entity';

export default function Profile() {
  const { t } = useTranslation();
  const { data: quizz, isLoading } = useGetQuizQuery();

  const questionsQuizz =
    quizz?.filter(quizzItem => quizzItem.quizzType === IQuizzType.QUESTIONS) ?? [];
  const cardsQuizz = quizz?.filter(quizzItem => quizzItem.quizzType === IQuizzType.CARDS) ?? [];

  return (
    <GlobalLayout>
      <AskCreateSection />
      <div className="profile-container">
        <span className="tag secondary profile-container__tag">Vos quizz</span>
        <div className="profile-container__quizz">
          {isLoading ? (
            <span className="loader" />
          ) : questionsQuizz.length > 0 ? (
            questionsQuizz.map((item: Quizz) => (
              <Card
                key={crypto.randomUUID()}
                image={item.image}
                badge={t('card.questions', { nbQuestions: item.questions?.length ?? 0 })}
                title={item.title}
                creationDate={item.creationDate}
                onEditClick={() => {}}
                onPresentationClick={() => {}}
              />
            ))
          ) : (
            <EmptyState
              title="Aucun quiz trouvé"
              description="Créez votre premier quiz pour commencer à apprendre !"
            />
          )}
        </div>
        <span className="tag secondary profile-container__tag">Vos cartes</span>
        <div className="profile-container__quizz">
          {isLoading ? (
            <span className="loader" />
          ) : cardsQuizz.length > 0 ? (
            cardsQuizz.map((item: Quizz) => (
              <Card
                key={crypto.randomUUID()}
                image={item.image}
                badge={t('card.cards', { nbCards: item.questions?.length ?? 0 })}
                title={item.title}
                creationDate={item.creationDate}
                onEditClick={() => {}}
                onPresentationClick={() => {}}
              />
            ))
          ) : (
            <EmptyState
              title="Aucune carte trouvée"
              description="Créez votre première carte pour commencer à apprendre !"
            />
          )}
        </div>
      </div>
    </GlobalLayout>
  );
}
