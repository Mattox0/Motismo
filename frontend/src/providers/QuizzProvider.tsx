'use client';

import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Question } from '@/types/model/Question';
import { Quizz } from '@/types/model/Quizz';

import { useAuth } from '../hooks/useAuth';
import { useGetOneQuizQuery } from '../services/quiz.service';

interface QuizzContextType {
  quizz: Quizz | undefined;
  isLoading: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
  currentQuestion: Question | null;
  selectCurrentQuestion: (_id: string) => void;
  refetch: () => void;
  isAuthor: boolean;
}

const QuizzContext = createContext<QuizzContextType | undefined>(undefined);

export const QuizzProvider: React.FC<{ children: React.ReactNode; quizId: string }> = ({
  children,
  quizId,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const { data: quizz, isLoading, error, refetch } = useGetOneQuizQuery(quizId);
  const { session } = useAuth();

  const isAuthor = useMemo(() => {
    if (!quizz || !session?.user) return false;
    return quizz.author.id === session.user.id;
  }, [quizz, session?.user]);

  useEffect(() => {
    if (quizz && quizz.questions && !currentQuestion && quizz?.questions?.length > 0) {
      setCurrentQuestion(quizz?.questions[0]);
    }
  }, [quizz]);

  const selectCurrentQuestion = (id: string) => {
    setCurrentQuestion(quizz?.questions?.find(question => question.id === id));
  };

  const value = useMemo(
    () => ({
      quizz,
      selectCurrentQuestion,
      currentQuestion,
      isLoading,
      error,
      refetch,
      isAuthor,
    }),
    [quizz, isLoading, error, isAuthor, currentQuestion]
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
