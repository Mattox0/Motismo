import { FC } from 'react';

import { GameFinished } from '@/components/game/GameFinished';
import { Lobby } from '@/components/game/Lobby';
import { QuestionChoicePresentation } from '@/components/game/QuestionChoicePresentation';
import { SplashScreen } from '@/components/SplashScreen';
import { AnswerResultsContainer } from '@/containers/AnswerResultsContainer';
import { RankingContainer } from '@/containers/RankingContainer';
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
  const { status, currentQuestion, timeLeft, answerStatistics, rankingStatistics, timerFinished } =
    useGame();
  const socket = useSocket();

  const startGame = () => {
    socket?.emit(IWebsocketEvent.START);
  };

  const showRanking = () => {
    socket?.emit(IWebsocketEvent.DISPLAY_RANKING);
  };

  const handleNextQuestion = () => {
    socket?.emit(IWebsocketEvent.NEXT_QUESTION);
  };

  if (status === IGameStatus.NOT_STARTED) {
    return <Lobby quizz={quizz} code={code} presentation handleClick={startGame} />;
  }

  if (status === IGameStatus.DISPLAY_QUESTION && currentQuestion) {
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
    return <AnswerResultsContainer statistics={answerStatistics} handleClick={showRanking} />;
  }

  if (status === IGameStatus.DISPLAY_RANKING && rankingStatistics) {
    return (
      <RankingContainer statistics={rankingStatistics} handleClick={() => handleNextQuestion()} />
    );
  }

  if (status === IGameStatus.FINISHED && rankingStatistics) {
    return <GameFinished statistics={rankingStatistics} />;
  }

  return <SplashScreen />;
};
