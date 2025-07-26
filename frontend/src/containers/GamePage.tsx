'use client';

import { FC } from 'react';

import { IPlayerData } from '@/app/game/[code]/page';
import { useWebsocket } from '@/hooks/useWebsocket';
import { useGame } from '@/providers/GameProvider';

interface IGamePageProps {
  player: IPlayerData;
  code: string;
}

export const GamePage: FC<IGamePageProps> = ({ player, code }) => {
  useWebsocket(code);
  const { isStarted, myUser } = useGame();

  return myUser?.isAuthor ? (
    <div>
      <h1>Game Author</h1>
    </div>
  ) : (
    <div>
      <h1>Game Player</h1>
    </div>
  );
};
