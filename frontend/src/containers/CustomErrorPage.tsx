'use client';

import { FC } from 'react';

import { Button } from '@/components/forms/Button';

interface ICustomErrorProps {
  image?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
  buttonText?: string;
}

export const CustomErrorPage: FC<ICustomErrorProps> = ({
  image,
  title,
  description,
  onClick,
  buttonText,
}) => (
  <div className="custom-error-page">
    {image && <img className="custom-error-page__image" src={image} alt={title} />}
    {title && <h3 className="custom-error-page__title">{title}</h3>}
    {description && <p className="custom-error-page__text">{description}</p>}
    {onClick && buttonText && (
      <div>
        <Button variant="primary" onClick={onClick}>
          {buttonText}
        </Button>
      </div>
    )}
  </div>
);
