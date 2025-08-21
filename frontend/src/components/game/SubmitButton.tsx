import { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
  submitText,
  submittedText,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <button className={`submit-btn ${className}`} onClick={onClick} disabled={disabled}>
      {isSubmitted
        ? submittedText || t('game.player.submitted')
        : submitText || t('game.player.submit')}
    </button>
  );
};
