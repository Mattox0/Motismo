import { FC } from 'react';

import { Lobby } from '@/components/game/Lobby';
import { QuestionChoicePlayer } from '@/components/game/QuestionChoicePlayer';
import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';
import { IGameStatus } from '@/types/websockets/IGameStatus';

interface IGamePlayerProps {
  quizz: IQuizz;
  code: string;
}

export const GamePlayer: FC<IGamePlayerProps> = ({ quizz, code }) => {
  const { status, currentQuestion, timeLeft } = useGame();

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

  return <div>GamePlayer</div>;
};
