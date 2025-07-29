import { FC } from 'react';

import { AnswerResults } from '@/components/game/AnswerResults';
import { Lobby } from '@/components/game/Lobby';
import { QuestionChoicePresentation } from '@/components/game/QuestionChoicePresentation';
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
  const { status, currentQuestion, timeLeft, answerStatistics, timerFinished } = useGame();
  const socket = useSocket();

  const startGame = () => {
    socket?.emit(IWebsocketEvent.START);
  };

  if (status === IGameStatus.NOT_STARTED) {
    return <Lobby quizz={quizz} code={code} presentation handleClick={startGame} />;
  }

  if (status === IGameStatus.DISPLAY_QUESTION && currentQuestion) {
    // faire un switch sur le type de question
    return (
      <QuestionChoicePresentation
        question={currentQuestion}
        timeLeft={timeLeft}
        totalQuestions={quizz.questions?.length}
        currentQuestionNumber={currentQuestion.order}
        isTimerFinished={timerFinished}
      />
    );
  }

  if (status === IGameStatus.DISPLAY_ANSWERS && answerStatistics) {
    return <AnswerResults statistics={answerStatistics} />;
  }

  return <div>GamePresentation</div>;
};
