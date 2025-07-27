import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { IGameUser } from '@/types/model/IGameUser';
import { IQuestion } from '@/types/model/IQuestion';
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
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);

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
    }),
    [status, myUser, users, currentQuestion, timeLeft]
  );

  return <GameContext.Provider value={values}>{children}</GameContext.Provider>;
};
