'use client';

import { useRouter } from 'next/navigation';
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CardFlip from '@/components/CardFlip';
import { Button } from '@/components/forms/Button';
import { useCard } from '@/providers/CardProvider';
import { IQuizzType } from '@/types/model/IQuizzType';

import { CustomErrorPage } from './CustomErrorPage';

interface ICardGamePageProps {
  cardId: string;
}

export const CardGamePage: FC<ICardGamePageProps> = () => {
  const { quizz, isLoading } = useCard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!quizz || !quizz.cards) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setCurrentIndex(i => Math.min(i + 1, (quizz.cards?.length ?? 1) - 1));
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'q') {
        setCurrentIndex(i => Math.max(i - 1, 0));
      } else if (e.key === ' ' || e.key === 'Enter') {
        setIsFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizz, quizz?.cards?.length]);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

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

  if (!quizz?.cards || quizz.cards.length === 0) {
    return (
      <CustomErrorPage
        image="/no-cards.svg"
        title={t('error.no.cards')}
        buttonText={t('error.return.dashboard')}
        onClick={() => router.push('/profile')}
      />
    );
  }

  const cards = quizz.cards;
  if (!cards) return null;
  const card = cards[currentIndex];

  const isImage = (value?: string) =>
    value && (value.startsWith('http') || value.match(/\.(jpeg|jpg|gif|png|webp)$/i));

  return (
    <div className="card-game">
      <div className="card-game__header">
        <div className="card-game__title">{quizz.title}</div>
      </div>
      <div className="card-game__card-container">
        <CardFlip
          frontContent={card.rectoImage || card.rectoText || ''}
          backContent={card.versoImage || card.versoText || ''}
          frontType={isImage(card.rectoImage) ? 'image' : 'text'}
          backType={isImage(card.versoImage) ? 'image' : 'text'}
          flipped={isFlipped}
          setFlipped={setIsFlipped}
        />
      </div>
      <div className="card-game__navigation">
        <Button
          variant="primary"
          onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="text-lg py-3"
        >
          {t('previous', 'Précédent')}
        </Button>
        <div>
          <span className="card-game__counter">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => setCurrentIndex(i => Math.min(i + 1, cards.length - 1))}
          disabled={currentIndex === cards.length - 1}
          className="text-lg py-3"
        >
          {t('next', 'Suivant')}
        </Button>
      </div>
    </div>
  );
};
