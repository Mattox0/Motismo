import { createElement, FC, ReactNode } from 'react';

interface ITitleProps {
  children: ReactNode;
  variant: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
}

const TITLE_ELEMENTS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
} as const;

export const Title: FC<ITitleProps> = ({ children, variant, className = '' }) => {
  return createElement(
    TITLE_ELEMENTS[variant],
    {
      className: ['title', `title-${variant}`, className].filter(Boolean).join(' '),
    },
    children
  );
};
