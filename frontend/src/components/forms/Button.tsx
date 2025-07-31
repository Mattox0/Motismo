import { FC } from 'react';

interface IButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'colored' | 'error' | 'other';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: FC<IButtonProps> = ({
  children,
  variant,
  startIcon,
  endIcon,
  className,
  disabled,
  onClick,
  type,
}) => {
  return (
    <button
      className={variant === 'other' ? `btn ${className}` : `btn btn-${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {startIcon && <span className="btn-icon start">{startIcon}</span>}
      {children}
      {endIcon && <span className="btn-icon end">{endIcon}</span>}
    </button>
  );
};
