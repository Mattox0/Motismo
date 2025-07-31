import { FC } from 'react';

import { AnswerResults } from '@/components/game/AnswerResults';
import { GameFinished } from '@/components/game/GameFinished';
import { Lobby } from '@/components/game/Lobby';
import { QuestionChoicePlayer } from '@/components/game/QuestionChoicePlayer';
import { Ranking } from '@/components/game/Ranking';
import { SplashScreen } from '@/components/SplashScreen';
import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';

interface IGamePlayerProps {
  quizz: IQuizz;
  code: string;
}

export const GamePlayer: FC<IGamePlayerProps> = ({ quizz, code }) => {
  const { status, currentQuestion, timeLeft, answerStatistics, rankingStatistics } = useGame();

  if (status === IGameStatus.NOT_STARTED) {
    return <Lobby quizz={quizz} code={code} />;
  }

  if (status === IGameStatus.DISPLAY_QUESTION && currentQuestion) {
    return (
      <QuestionChoicePlayer
        question={currentQuestion}
        timeLeft={timeLeft}
        totalQuestions={quizz.questions?.length}
        currentQuestionNumber={currentQuestion.order}
      />
    );
  }

  if (status === IGameStatus.DISPLAY_ANSWERS && answerStatistics) {
    return <AnswerResults statistics={answerStatistics} />;
  }

  if (status === IGameStatus.DISPLAY_RANKING && rankingStatistics) {
    return <Ranking statistics={rankingStatistics} />;
  }

  if (status === IGameStatus.FINISHED && rankingStatistics) {
    return <GameFinished statistics={rankingStatistics} />;
  }

  return <SplashScreen />;
};
