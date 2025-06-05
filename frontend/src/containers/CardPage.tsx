'use client';

import { Box, Typography, Button } from '@mui/material';
import { FC, useState } from 'react';

import { CardForm, CardFormData } from '@/components/forms/CardForm';
import { useCard } from '@/providers/CardProvider';

interface ICardPageProps {
  quizzId: string;
}

export const CardPage: FC<ICardPageProps> = ({ quizzId: _quizzId }) => {
  const { quizz } = useCard();
  const [cards, setCards] = useState<number[]>([0]); // Commence avec un formulaire

  const handleAddCard = () => {
    setCards(prev => [...prev, prev.length]);
  };

  const handleCardSubmit = async (data: CardFormData) => {
    try {
      // TODO: Appel API pour sauvegarder une carte
      console.log('Sauvegarde de la carte:', data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {quizz?.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Créez vos cartes
        </Typography>
      </Box>

      {cards.map(index => (
        <CardForm key={index} index={index} onSubmit={handleCardSubmit} />
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleAddCard}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            px: 4,
            py: 1.5,
          }}
        >
          Ajouter une carte
        </Button>
      </Box>
    </Box>
  );
};
