'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FC, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import CardFlip from '@/components/CardFlip';
import { Button } from '@/components/forms/Button';
import { useCard } from '@/providers/CardProvider';
import { IQuizzType } from '@/types/model/IQuizzType';

import { CustomErrorPage } from './CustomErrorPage';

const isImage = (value?: string) =>
  value && (value.startsWith('http') || value.match(/\.(jpeg|jpg|gif|png|webp)$/i));

export const CardGamePage: FC = () => {
  const { quizz, isLoading } = useCard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const router = useRouter();
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrev = useCallback(() => {
    setDirection('prev');
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setDirection('next');
    setCurrentIndex(i => Math.min(i + 1, (quizz?.cards?.length ?? 1) - 1));
  }, [quizz?.cards?.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'q') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        setIsFlipped(f => !f);
      }
    },
    [handleNext, handlePrev]
  );

  useEffect(() => {
    if (!quizz || !quizz.cards) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizz, quizz?.cards?.length, handleKeyDown]);

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
  const card = cards[currentIndex];

  const variants = {
    enter: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="card-game" aria-labelledby="card-game-title">
      <div className="card-game__header">
        <div className="card-game__title" id="card-game-title">
          {quizz.title}
        </div>
      </div>
      <div className="card-game__card-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ width: '100%' }}
            tabIndex={0}
            aria-label={
              isFlipped
                ? t('card.back', { current: currentIndex + 1, total: cards.length })
                : t('card.front', { current: currentIndex + 1, total: cards.length })
            }
          >
            <CardFlip
              frontContent={card.rectoImage || card.rectoText || ''}
              backContent={card.versoImage || card.versoText || ''}
              frontType={isImage(card.rectoImage) ? 'image' : 'text'}
              backType={isImage(card.versoImage) ? 'image' : 'text'}
              flipped={isFlipped}
              setFlipped={setIsFlipped}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="card-game__navigation">
        <Button
          variant="primary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="text-lg py-3"
          aria-label={t('common.previous')}
        >
          {t('common.previous')}
        </Button>
        <div>
          <span className="card-game__counter" aria-live="polite" aria-atomic="true">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="text-lg py-3"
          aria-label={t('common.next')}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
