import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { IAnswerStatistics } from '@/types/model/IAnswerStatistics';
import { IGameUser } from '@/types/model/IGameUser';
import { IQuestion } from '@/types/model/IQuestion';
import { IRankingStatistics } from '@/types/model/IRanking';
import { IGameStatus } from '@/types/websockets/IGameStatus';

interface IGameContextType {
  status: IGameStatus;
  setStatus: (status: IGameStatus) => void;
  myUser: IGameUser | null;
  setMyUser: (user: IGameUser | null) => void;
  users: IGameUser[];
  setUsers: (users: IGameUser[]) => void;
  currentQuestion: IQuestion | null;
  setCurrentQuestion: (question: IQuestion | null) => void;
  timeLeft?: number;
  setTimeLeft: (timeLeft: number | undefined) => void;
  answerStatistics: IAnswerStatistics | null;
  setAnswerStatistics: (statistics: IAnswerStatistics | null) => void;
  rankingStatistics: IRankingStatistics | null;
  setRankingStatistics: (statistics: IRankingStatistics | null) => void;
  answerCount: { answered: number; total: number };
  setAnswerCount: (count: { answered: number; total: number }) => void;
  timerFinished: boolean;
  setTimerFinished: (finished: boolean) => void;
}

const GameContext = createContext<IGameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface IGameProviderProperties {
  children: ReactNode;
}

export const GameProvider: React.FC<IGameProviderProperties> = ({ children }) => {
  const [status, setStatus] = useState(IGameStatus.NOT_STARTED);
  const [myUser, setMyUser] = useState<IGameUser | null>(null);
  const [users, setUsers] = useState<IGameUser[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(30000);
  const [answerStatistics, setAnswerStatistics] = useState<IAnswerStatistics | null>(null);
  const [rankingStatistics, setRankingStatistics] = useState<IRankingStatistics | null>(null);
  const [answerCount, setAnswerCount] = useState<{ answered: number; total: number }>({
    answered: 0,
    total: 0,
  });
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  const values = useMemo(
    () => ({
      status,
      setStatus,
      myUser,
      setMyUser,
      users,
      setUsers,
      currentQuestion,
      setCurrentQuestion,
      timeLeft,
      setTimeLeft,
      answerStatistics,
      setAnswerStatistics,
      rankingStatistics,
      setRankingStatistics,
      answerCount,
      setAnswerCount,
      timerFinished,
      setTimerFinished,
    }),
    [
      status,
      myUser,
      users,
      currentQuestion,
      timeLeft,
      answerStatistics,
      rankingStatistics,
      answerCount,
      timerFinished,
    ]
  );

  return <GameContext.Provider value={values}>{children}</GameContext.Provider>;
};
