import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { IGameUser } from '@/types/model/IGameUser';

interface IGameContextType {
  isStarted: boolean;
  setIsStarted: (value: boolean) => void;
  myUser: IGameUser | null;
  setMyUser: (user: IGameUser | null) => void;
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
  const [isStarted, setIsStarted] = useState(false);
  const [myUser, setMyUser] = useState<IGameUser | null>(null);

  const values = useMemo(
    () => ({
      isStarted,
      setIsStarted,
      myUser,
      setMyUser,
    }),
    [isStarted, myUser]
  );

  return <GameContext.Provider value={values}>{children}</GameContext.Provider>;
};
