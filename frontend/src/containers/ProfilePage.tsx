'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { EditCardForm } from '@/components/forms/EditCardForm';
import { EditQuizForm } from '@/components/forms/EditQuizForm';
import { Modal } from '@/components/Modal';
import { AskCreateSection } from '@/components/sections/AskCreateSection';
import {
  useCreateGameMutation,
  useGetQuizQuery,
  useUpdateQuizzMutation,
} from '@/services/quiz.service';
import { IUserRole } from '@/types/IUserRole';
import { IQuizz } from '@/types/model/IQuizz';
import { IQuizzType } from '@/types/model/IQuizzType';
import { EditCardFormData } from '@/types/schemas/editCardSchema';
import { EditQuizFormData } from '@/types/schemas/editQuizSchema';
import { showToast } from '@/utils/toast';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: quizz, isLoading } = useGetQuizQuery();
  const [createGame] = useCreateGameMutation();
  const [updateQuizz] = useUpdateQuizzMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<IQuizz | null>(null);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<IQuizz | null>(null);

  const isTeacher =
    session?.user?.role === IUserRole.Teacher || session?.user?.role === IUserRole.Admin;
  const isStudent = session?.user?.role === IUserRole.Student;

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

  const handleEditCard = (card: IQuizz) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCard(null);
  };

  const handleEditCardSubmit = async (data: EditCardFormData) => {
    if (!selectedCard) return;

    try {
      const formData = new FormData();
      formData.append('title', data.title);

      if (data.image) {
        formData.append('image', data.image);
      }

      // Always send classIds as an array, even if empty
      if (data.classIds && data.classIds.length > 0) {
        data.classIds.forEach(classId => {
          formData.append('classIds', classId);
        });
      } else {
        // Send empty array
        formData.append('classIds', '[]');
      }

      await updateQuizz({ id: selectedCard.id, formData }).unwrap();
      showToast.success(t('edit_card.success'));
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating card:', error);
      showToast.error(t('edit_card.error'));
    }
  };

  const handleEditQuiz = (quiz: IQuizz) => {
    setSelectedQuiz(quiz);
    setIsEditQuizModalOpen(true);
  };

  const handleCloseEditQuizModal = () => {
    setIsEditQuizModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleEditQuizSubmit = async (data: EditQuizFormData) => {
    if (!selectedQuiz) return;

    try {
      const formData = new FormData();
      formData.append('title', data.title);

      if (data.image) {
        formData.append('image', data.image);
      }

      await updateQuizz({ id: selectedQuiz.id, formData }).unwrap();
      showToast.success(t('edit_quiz.success'));
      handleCloseEditQuizModal();
    } catch (error) {
      console.error('Error updating quiz:', error);
      showToast.error(t('edit_quiz.error'));
    }
  };

  return (
    <>
      {isTeacher && <AskCreateSection />}
      <div className="profile-container">
        {isTeacher && (
          <>
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
                    onCardClick={() => handleEditQuiz(item)}
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
          </>
        )}

        {isStudent && (
          <span className="tag secondary profile-container__tag">Mes cartes assignées</span>
        )}

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
                onEditClick={isTeacher ? () => router.push(`/card/${item.id}`) : undefined}
                onCardClick={isTeacher ? () => handleEditCard(item) : undefined}
                onPresentationClick={() =>
                  item.cards?.length
                    ? router.push(`/card/game/${item.id}`)
                    : showToast.error(t('error.no.cards'))
                }
              />
            ))
          ) : (
            <EmptyState
              title={isStudent ? 'Aucune carte assignée' : 'Aucune carte trouvée'}
              description={
                isStudent
                  ? "Vos professeurs n'ont pas encore assigné de cartes."
                  : 'Créez votre première carte pour commencer à apprendre !'
              }
            />
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title={t('edit_card.title')}>
        {selectedCard && (
          <EditCardForm
            card={selectedCard}
            onSubmit={handleEditCardSubmit}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditQuizModalOpen}
        onClose={handleCloseEditQuizModal}
        title={t('edit_quiz.title')}
      >
        {selectedQuiz && (
          <EditQuizForm
            quiz={selectedQuiz}
            onSubmit={handleEditQuizSubmit}
            onCancel={handleCloseEditQuizModal}
          />
        )}
      </Modal>
    </>
  );
};
