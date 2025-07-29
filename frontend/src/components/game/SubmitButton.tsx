import { FC } from 'react';

interface ISubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isSubmitted?: boolean;
  submitText?: string;
  submittedText?: string;
  className?: string;
}

export const SubmitButton: FC<ISubmitButtonProps> = ({
  onClick,
  disabled = false,
  isSubmitted = false,
  submitText = 'Valider',
  submittedText = 'Réponse envoyée',
  className = '',
}) => {
  return (
    <button className={`submit-btn ${className}`} onClick={onClick} disabled={disabled}>
      {isSubmitted ? submittedText : submitText}
    </button>
  );
};
