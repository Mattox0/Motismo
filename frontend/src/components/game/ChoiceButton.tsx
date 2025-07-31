import { FC } from 'react';

interface IChoiceButtonProps {
  choice: {
    text: string;
  };
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
  disabled?: boolean;
  isMultipleChoice?: boolean;
}

export const ChoiceButton: FC<IChoiceButtonProps> = ({
  choice,
  index,
  isSelected,
  onClick,
  disabled = false,
  isMultipleChoice = false,
}) => {
  return (
    <button
      className={`choice-btn ${isSelected ? 'choice-btn--selected' : ''} ${
        isMultipleChoice ? 'choice-btn--multiple' : ''
      }`}
      onClick={() => onClick(index)}
      disabled={disabled}
    >
      <span className="choice-btn__letter">{String.fromCharCode(64 + index)}</span>
      <span className="choice-btn__text">{choice.text}</span>
      {isMultipleChoice && <span className="choice-btn__checkbox">{isSelected ? '✓' : '□'}</span>}
    </button>
  );
};
