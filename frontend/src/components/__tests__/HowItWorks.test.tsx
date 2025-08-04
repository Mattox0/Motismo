import { render, screen } from '@testing-library/react';

import HowItWorks from '../HowItWorks';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: () => '0%',
}));

jest.mock('../Step', () => {
  return function MockStep({ step }: any) {
    return (
      <div data-testid={`step-${step.number}`}>
        <h4>{step.title}</h4>
        <p>{step.description}</p>
      </div>
    );
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('HowItWorks', () => {
  it('renders without crashing', () => {
    expect(() => render(<HowItWorks />)).not.toThrow();
  });

  it('displays the main title and subtitle as headings', () => {
    render(<HowItWorks />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('howItWorks.title');

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('howItWorks.subtitle');
  });

  it('renders all three steps', () => {
    render(<HowItWorks />);
    [1, 2, 3].forEach(n => {
      expect(screen.getByTestId(`step-${n}`)).toBeInTheDocument();
    });
  });
});
