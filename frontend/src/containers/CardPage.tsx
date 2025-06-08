'use client';

import { FC } from 'react';

import { CardForm, CardFormData } from '@/components/forms/CardForm';
import { initializeCard } from '@/core/initializeCard';
import { useCard } from '@/providers/CardProvider';
import { useCreateCardMutation, useUpdateCardMutation } from '@/services/card.service';

interface ICardPageProps {
  quizzId: string;
}

export const CardPage: FC<ICardPageProps> = ({ quizzId: quizzId }) => {
  const { quizz } = useCard();
  const [createCard] = useCreateCardMutation();
  const [updateCard] = useUpdateCardMutation();

  const handleAddCard = () => {
    const formData = initializeCard();
    createCard({ quizzId: quizzId, formData });
  };

  const handleCardSubmit = async (data: CardFormData, id: string) => {
    try {
      const formData = new FormData();
      formData.append('rectoText', data.term);
      formData.append('versoText', data.definition);
      if (data.rectoImage) {
        formData.append('rectoImage', data.rectoImage);
      }
      if (data.versoImage) {
        formData.append('versoImage', data.versoImage);
      }

      await updateCard({
        quizzId,
        cardId: id,
        formData,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  return (
    <div className="card-page">
      <div className="card-page__header">
        <h1 className="card-page__title">{quizz?.title}</h1>
      </div>

      {quizz?.cards?.map(card => (
        <CardForm
          key={crypto.randomUUID()}
          index={card.order}
          onSubmit={handleCardSubmit}
          initialData={card}
        />
      ))}

      <div className="card-page__add-button">
        <button onClick={handleAddCard}>Ajouter une carte</button>
      </div>
    </div>
  );
};
