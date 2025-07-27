import { FC } from 'react';

import { Lobby } from '@/components/game/Lobby';
import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';

interface IGamePlayerProps {
  quizz: IQuizz;
  code: string;
}

export const GamePlayer: FC<IGamePlayerProps> = ({ quizz, code }) => {
  const { status } = useGame();

  if (status === IGameStatus.NOT_STARTED) {
    return <Lobby quizz={quizz} code={code} />;
  }

  return <div>GamePlayer</div>;
};
