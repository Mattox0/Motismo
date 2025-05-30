'use client';

import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, { createContext, useContext, useMemo } from 'react';

import { Quizz } from '../../../backend/src/quizz/quizz.entity';
import { useAuth } from '../hooks/useAuth';
import { useGetOneQuizQuery } from '../services/quiz.service';

interface QuizzContextType {
  quizz: Quizz | undefined;
  isLoading: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
  refetch: () => void;
  isAuthor: boolean;
}

const QuizzContext = createContext<QuizzContextType | undefined>(undefined);

export const QuizzProvider: React.FC<{ children: React.ReactNode; quizId: string }> = ({
  children,
  quizId,
}) => {
  const { data: quizz, isLoading, error, refetch } = useGetOneQuizQuery(quizId);
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
      refetch,
      isAuthor,
    }),
    [quizz, isLoading, error, isAuthor]
  );

  return <QuizzContext.Provider value={value}>{children}</QuizzContext.Provider>;
};

export const useQuizz = () => {
  const context = useContext(QuizzContext);
  if (context === undefined) {
    throw new Error('useQuizz must be used within a QuizzProvider');
  }
  return context;
};
