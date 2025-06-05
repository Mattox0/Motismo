'use client';

import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, { createContext, useContext, useMemo } from 'react';

import { Quizz } from '@/types/model/Quizz';

import { useAuth } from '../hooks/useAuth';
import { useGetOneQuizQuery } from '../services/quiz.service';

interface CardContextType {
  quizz: Quizz | undefined;
  isLoading: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
  isAuthor: boolean;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: React.ReactNode; quizId: string }> = ({
  children,
  quizId,
}) => {
  const { data: quizz, isLoading, error } = useGetOneQuizQuery(quizId);
  const { session } = useAuth();

  const isAuthor = useMemo(() => {
    if (!quizz || !session?.user) return false;
    return quizz.author.id === session.user.id;
  }, [quizz, session?.user]);

  const value = useMemo(
    () => ({
      quizz,
      isLoading,
      error,
      isAuthor,
    }),
    [quizz, isLoading, error, isAuthor]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

export const useCard = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return context;
};
