import Image from 'next/image';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Title } from '@/components/Title';
import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';

import { Timer } from './Timer';

interface IQuestionChoicePresentationProps {
  question: IQuestion;
  timeLeft?: number;
  currentQuestionNumber?: number;
  totalQuestions?: number;
  isTimerFinished?: boolean;
}

export const QuestionChoicePresentation: FC<IQuestionChoicePresentationProps> = ({
  question,
  timeLeft,
  currentQuestionNumber,
  totalQuestions,
  isTimerFinished = false,
}) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const { answerCount } = useGame();

  const handleShowResults = () => {
    socket?.emit(IWebsocketEvent.DISPLAY_ANSWER);
  };
  return (
    <div className="question-presentation">
      <div className="question-presentation__header">
        {currentQuestionNumber && totalQuestions && (
          <div className="question-counter">
            <span className="counter-text">
              {currentQuestionNumber} / {totalQuestions}
            </span>
          </div>
        )}

        {timeLeft !== undefined && (
          <Timer
            timeLeft={timeLeft}
            answerCount={answerCount}
            isFinished={isTimerFinished}
            isPresenter={true}
            onFinishedClick={handleShowResults}
          />
        )}
      </div>

      <div className="question-presentation__main">
        <div className="question-presentation__title">
          <Title variant="h1" className="question-title">
            {question.title}
          </Title>
        </div>

        {question.image && (
          <div className="question-presentation__image">
            <Image
              src={question.image}
              alt={question.title}
              width={600}
              height={400}
              className="question-image"
              priority
            />
          </div>
        )}

        {question.choices && question.choices.length > 0 && (
          <div className="question-presentation__choices">
            <div className="choices-grid">
              {question.choices.map((choice, index) => (
                <div key={index} className="choice-item">
                  <div className="choice-item__letter">{String.fromCharCode(65 + index)}</div>
                  <div className="choice-item__text">{choice.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!question.choices || question.choices.length === 0) && (
          <div className="question-presentation__placeholder">
            <p className="placeholder-text">{t('game.question.participantsAnswering')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
