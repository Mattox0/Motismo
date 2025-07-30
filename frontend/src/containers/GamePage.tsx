'use client';

import { FC } from 'react';

import { SplashScreen } from '@/components/SplashScreen';
import { useWebsocket } from '@/hooks/useWebsocket';
import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';

import { GamePlayer } from './GamePlayer';
import { GamePresentation } from './GamePresentation';

interface IGamePageProps {
  code: string;
  quizz: IQuizz;
}

export const GamePage: FC<IGamePageProps> = ({ code, quizz }) => {
  useWebsocket(code);
  const { myUser } = useGame();

  if (!myUser) {
    return <SplashScreen />;
  }

  return myUser?.isAuthor ? (
    <GamePresentation quizz={quizz} code={code} />
  ) : (
    <GamePlayer quizz={quizz} code={code} />
  );
};
