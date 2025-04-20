import { FC } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'colored';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: FC<ButtonProps> = ({
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
      className={`btn btn-${variant} ${className}`}
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
