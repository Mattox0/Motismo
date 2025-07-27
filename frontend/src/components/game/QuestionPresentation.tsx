import Image from 'next/image';
import { FC } from 'react';

import { Title } from '@/components/Title';
import { IQuestion } from '@/types/model/IQuestion';

interface IQuestionPresentationProps {
  question: IQuestion;
  timeLeft?: number;
}

export const QuestionPresentation: FC<IQuestionPresentationProps> = ({ question, timeLeft }) => {
  console.log(question);
  const formatTime = (time: number) => {
    return Math.ceil(time / 1000);
  };

  return (
    <div className="question-presentation">
      {/* Timer */}
      {timeLeft !== undefined && (
        <div className="question-presentation__timer">
          <span className="timer-text">{formatTime(timeLeft)}s</span>
        </div>
      )}

      {/* Question Content */}
      <div className="question-presentation__content">
        {/* Image */}
        {question.image && (
          <div className="question-presentation__image">
            <Image
              src={question.image}
              alt={question.title}
              width={400}
              height={300}
              className="question-image"
            />
          </div>
        )}

        {/* Title */}
        <div className="question-presentation__title">
          <Title variant="h1" className="question-title">
            {question.title}
          </Title>
        </div>

        {/* Choices - Only for multiple choice questions */}
        {question.choices && question.choices.length > 0 && (
          <div className="question-presentation__choices">
            {question.choices.map((choice, index) => (
              <div key={index} className="choice-item">
                <div className="choice-item__letter">{String.fromCharCode(65 + index)}</div>
                <div className="choice-item__text">{choice.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* For other question types */}
        {(!question.choices || question.choices.length === 0) && (
          <div className="question-presentation__placeholder">
            <p className="placeholder-text">Les participants répondent à cette question...</p>
          </div>
        )}
      </div>
    </div>
  );
};
