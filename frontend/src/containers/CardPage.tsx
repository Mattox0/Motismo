'use client';

import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { CardForm, CardFormData } from '@/components/forms/CardForm';
import { initializeCard } from '@/core/initializeCard';
import { useCard } from '@/providers/CardProvider';
import { useCreateCardMutation, useUpdateCardMutation } from '@/services/card.service';

interface ICardPageProps {
  quizzId: string;
}

export const CardPage: FC<ICardPageProps> = ({ quizzId: quizzId }) => {
  const { quizz, isLoading } = useCard();
  const { t } = useTranslation();
  const [createCard] = useCreateCardMutation();
  const [updateCard] = useUpdateCardMutation();

  const handleAddCard = () => {
    const formData = initializeCard();
    createCard({ quizzId: quizzId, formData });
  };

  const handleCardSubmit = async (data: CardFormData, id: string) => {
    try {
      const formData = new FormData();
      if (data.rectoImage) {
        formData.append('rectoImage', data.rectoImage);
        formData.append('rectoText', '');
      } else if (data.term) {
        formData.append('rectoText', data.term);
      }

      if (data.versoImage) {
        formData.append('versoImage', data.versoImage);
        formData.append('versoText', '');
      } else if (data.definition) {
        formData.append('versoText', data.definition);
      }

      const response = await updateCard({
        quizzId,
        cardId: id,
        formData,
      });
      if (response?.error) {
        throw new Error();
      } else {
        toast.success(t('create_card.updateSuccess'));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="parent-loader">
        <span className="loader"></span>
      </div>
    );
  }

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
