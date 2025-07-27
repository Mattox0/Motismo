import { FC } from 'react';

import { Lobby } from '@/components/game/Lobby';
import { QuestionPresentation } from '@/components/game/QuestionPresentation';
import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';

interface IGamePresentationProps {
  quizz: IQuizz;
  code: string;
}

export const GamePresentation: FC<IGamePresentationProps> = ({ quizz, code }) => {
  const { status, currentQuestion, timeLeft } = useGame();
  const socket = useSocket();

  const startGame = () => {
    socket?.emit(IWebsocketEvent.START);
  };

  if (status === IGameStatus.NOT_STARTED) {
    return <Lobby quizz={quizz} code={code} presentation handleClick={startGame} />;
  }

  if (status === IGameStatus.DISPLAY_QUESTION && currentQuestion) {
    return <QuestionPresentation question={currentQuestion} timeLeft={timeLeft} />;
  }

  return <div>GamePresentation</div>;
};
