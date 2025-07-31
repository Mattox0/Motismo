import Image from 'next/image';
import { FC, useState } from 'react';

import { Title } from '@/components/Title';
import { useGame } from '@/providers/GameProvider';
import { useSocket } from '@/providers/SocketProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IQuestionType } from '@/types/QuestionType';
import { IWebsocketEvent } from '@/types/websockets/IWebsocketEvent';

import { ChoiceButton } from './ChoiceButton';
import { SubmitButton } from './SubmitButton';
import { Timer } from './Timer';

interface IQuestionChoicePlayerProps {
  question: IQuestion;
  timeLeft?: number;
  currentQuestionNumber?: number;
  totalQuestions?: number;
  disabled?: boolean;
}

export const QuestionChoicePlayer: FC<IQuestionChoicePlayerProps> = ({
  question,
  timeLeft,
  currentQuestionNumber,
  totalQuestions,
  disabled = false,
}) => {
  const socket = useSocket();
  const { answerCount, timerFinished } = useGame();
  const isMultipleChoice = question.questionType === IQuestionType.MULTIPLE_CHOICES;
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChoiceClick = (index: number) => {
    if (!disabled && !isSubmitted) {
      if (isMultipleChoice) {
        setSelectedChoices(prev =>
          prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
      } else {
        setSelectedChoices([index]);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedChoices.length > 0 && !isSubmitted) {
      setIsSubmitted(true);

      const choiceIds = selectedChoices.map(index => question.choices?.[index].id);

      const answerData = {
        type: IQuestionType.UNIQUE_CHOICES,
        answer: isMultipleChoice ? choiceIds[0] : choiceIds,
      };

      socket?.emit(IWebsocketEvent.ANSWER, answerData);
    }
  };

  return (
    <div className="question-player">
      <div className="question-player__header">
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
            isFinished={timerFinished}
            isPresenter={false}
          />
        )}
      </div>

      <div className="question-player__content">
        <div className="question-player__question">
          <Title variant="h2" className="question-title">
            {question.title}
          </Title>

          {question.image && (
            <div className="question-player__image">
              <Image
                src={question.image}
                alt={question.title}
                width={400}
                height={200}
                className="question-image"
              />
            </div>
          )}
        </div>

        {question.choices && question.choices.length > 0 && (
          <div className="question-player__choices">
            {question.choices.map((choice, index) => (
              <ChoiceButton
                key={index}
                choice={choice}
                index={index}
                isSelected={selectedChoices.includes(index)}
                onClick={handleChoiceClick}
                disabled={disabled || isSubmitted}
                isMultipleChoice={isMultipleChoice}
              />
            ))}
          </div>
        )}

        {(!question.choices || question.choices.length === 0) && (
          <div className="question-player__input">
            <textarea
              className="response-textarea"
              placeholder="Votre réponse..."
              rows={4}
              disabled={disabled || isSubmitted}
            />
          </div>
        )}

        {question.choices && question.choices.length > 0 && (
          <div className="question-player__submit">
            <SubmitButton
              onClick={handleSubmit}
              disabled={selectedChoices.length === 0 || disabled || isSubmitted}
              isSubmitted={isSubmitted}
            />
          </div>
        )}
      </div>
    </div>
  );
};
