'use client';

import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { IQuestion } from '@/types/model/IQuestion';
import { IQuizz } from '@/types/model/IQuizz';

import { useAuth } from '../hooks/useAuth';
import { useGetOneQuizQuery } from '../services/quiz.service';

interface IQuizzContextType {
  quizz: IQuizz | undefined;
  isLoading: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
  currentQuestion: IQuestion | null;
  setCurrentQuestion: Dispatch<SetStateAction<IQuestion | null>>;
  selectCurrentQuestion: (_id: string) => void;
  refetch: () => void;
  isAuthor: boolean;
}

const QuizzContext = createContext<IQuizzContextType | undefined>(undefined);

export const QuizzProvider: React.FC<{ children: React.ReactNode; quizId: string }> = ({
  children,
  quizId,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(null);
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
    setCurrentQuestion(quizz?.questions?.find(question => question.id === id) || null);
  };

  const value = useMemo(
    () => ({
      quizz,
      selectCurrentQuestion,
      currentQuestion,
      setCurrentQuestion,
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
