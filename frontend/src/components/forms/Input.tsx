'use client';

import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import React, { forwardRef, ReactNode, InputHTMLAttributes, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface IInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  registration?: UseFormRegisterReturn;
  isPassword?: boolean;
  className?: string;
  id?: string;
  type?: string;
  autoComplete?: string;
}

const Input = forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      registration,
      isPassword = false,
      className = '',
      id,
      type,
      autoComplete = 'off',
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId =
      id ||
      `input-${label?.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}

        <div className="input-wrapper">
          {startAdornment && <div className="input-icon input-icon-start">{startAdornment}</div>}

          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={`form-input ${error ? 'input-error' : ''} ${startAdornment ? 'has-start-icon' : ''} ${endAdornment || isPassword ? 'has-end-icon' : ''} ${className}`}
            aria-invalid={!!error}
            autoComplete={autoComplete}
            {...registration}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle input-icon input-icon-end"
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </button>
          )}

          {endAdornment && !isPassword && (
            <div className="input-icon input-icon-end">{endAdornment}</div>
          )}
        </div>

        {(error || helperText) && (
          <p className={`input-help-text ${error ? 'input-error-text' : ''}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
