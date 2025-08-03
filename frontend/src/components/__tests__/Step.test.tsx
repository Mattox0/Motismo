import React from 'react';
import { render, screen } from '@testing-library/react';
import Step, { IStep } from '../Step';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h4:  ({ children, ...props }: any) => <h4  {...props}>{children}</h4>,
    p:   ({ children, ...props }: any) => <p   {...props}>{children}</p>,
  },
  useInView: () => true,
}));

describe('Step', () => {
  const mockStep: IStep = {
    number: 1,
    title: 'Test Step Title',
    description: 'Test step description',
  };

  it('renders the step component with correct content', () => {
    render(<Step step={mockStep} index={0} />);

    expect(screen.getByText('Test Step Title')).toBeInTheDocument();
    expect(screen.getByText('Test step description')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies correct CSS classes for even index', () => {
    render(<Step step={mockStep} index={0} />);

    const stepElement = screen
      .getByText('Test Step Title')
      .closest('.step');
    expect(stepElement).toBeInTheDocument();
    expect(stepElement).not.toHaveClass('step--reverse');
  });

  it('applies correct CSS classes for odd index', () => {
    render(<Step step={mockStep} index={1} />);

    const stepElement = screen
      .getByText('Test Step Title')
      .closest('.step');
    expect(stepElement).toBeInTheDocument();
    expect(stepElement).toHaveClass('step--reverse');
  });
});
