'use client';

import { FC } from 'react';

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
    <div className="parent-loader">
      <span className="loader"></span>
    </div>;
  }

  return myUser?.isAuthor ? (
    <GamePresentation quizz={quizz} code={code} />
  ) : (
    <GamePlayer quizz={quizz} code={code} />
  );
};
