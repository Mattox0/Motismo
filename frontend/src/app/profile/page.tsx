'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { AskCreateSection } from '@/components/sections/AskCreateSection';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { useCreateGameMutation, useGetQuizQuery } from '@/services/quiz.service';
import { IQuizz } from '@/types/model/IQuizz';
import { IQuizzType } from '@/types/model/IQuizzType';
import { showToast } from '@/utils/toast';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: quizz, isLoading } = useGetQuizQuery();
  const [createGame] = useCreateGameMutation();

  const questionsQuizz =
    quizz?.filter(quizzItem => quizzItem.quizzType === IQuizzType.QUESTIONS) ?? [];
  const cardsQuizz = quizz?.filter(quizzItem => quizzItem.quizzType === IQuizzType.CARDS) ?? [];

  const handleCreateGame = async (id: string) => {
    try {
      const game = await createGame(id).unwrap();
      router.push(`/game/${game.code}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GlobalLayout>
      <AskCreateSection />
      <div className="profile-container">
        <span className="tag secondary profile-container__tag">Vos quizz</span>
        <div className="profile-container__quizz">
          {isLoading ? (
            <span className="loader" />
          ) : questionsQuizz.length > 0 ? (
            questionsQuizz.map((item: IQuizz) => (
              <Card
                key={crypto.randomUUID()}
                image={item.image}
                badge={t('card.questions', { nbQuestions: item.questions?.length ?? 0 })}
                title={item.title}
                creationDate={item.creationDate}
                onEditClick={() => router.push(`/quiz/${item.id}`)}
                onPresentationClick={() => handleCreateGame(item.id)}
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
            cardsQuizz.map((item: IQuizz) => (
              <Card
                key={crypto.randomUUID()}
                image={item.image}
                badge={t('card.cards', { nbCards: item.cards?.length ?? 0 })}
                title={item.title}
                creationDate={item.creationDate}
                onEditClick={() => router.push(`/card/${item.id}`)}
                onPresentationClick={() =>
                  item.cards?.length
                    ? router.push(`/card/game/${item.id}`)
                    : showToast.error(t('error.no.cards'))
                }
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
