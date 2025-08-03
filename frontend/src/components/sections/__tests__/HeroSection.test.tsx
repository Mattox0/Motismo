/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { HeroSection } from '../HeroSection';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/components/CallToAction', () => ({
  CallToAction: ({ variant, icon, title, description, onSubmit, button, input }: any) => (
    <div data-testid={`call-to-action-${variant}`}>
      <div data-testid="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {input && <div data-testid="input-container">{input}</div>}
      <div data-testid="button-container">
        {button}
      </div>
    </div>
  ),
}));

jest.mock('@/components/forms/Button', () => ({
  Button: ({ children, variant, startIcon, type, onClick }: any) => (
    <button
      type={type}
      onClick={onClick}
      data-testid={`button-${variant}`}
      data-start-icon={startIcon ? 'true' : 'false'}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/forms/Input', () => {
  return function MockInput({ label, placeholder, error, registration, maxLength, autoComplete }: any) {
    return (
      <div>
        <label>{label}</label>
        <input
          {...registration}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          data-testid="quiz-code-input"
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  };
});

jest.mock('@mui/icons-material/PeopleOutlineRounded', () => {
  return function MockPeopleIcon() {
    return <div data-testid="people-icon" />;
  };
});

jest.mock('@mui/icons-material/Draw', () => {
  return function MockDrawIcon() {
    return <div data-testid="draw-icon" />;
  };
});

jest.mock('@mui/icons-material/LoginRounded', () => {
  return function MockLoginIcon() {
    return <div data-testid="login-icon" />;
  };
});

const mockRouter = {
  push: jest.fn(),
};

describe('HeroSection component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render hero section with title and subtitle', () => {
    render(<HeroSection />);

    expect(screen.getByText('hero.title')).toBeInTheDocument();
    expect(screen.getByText('hero.subtitle')).toBeInTheDocument();
  });

  it('should render icons in call to actions', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('people-icon')).toBeInTheDocument();
    expect(screen.getByTestId('draw-icon')).toBeInTheDocument();
  });

  it('should render quiz code input in join section', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('quiz-code-input')).toBeInTheDocument();
    expect(screen.getByText('hero.join.quizzInput')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('hero.join.quizzInputPlaceholder')).toBeInTheDocument();
  });

  it('should have correct input attributes', () => {
    render(<HeroSection />);

    const input = screen.getByTestId('quiz-code-input');
    expect(input).toHaveAttribute('maxLength', '6');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('should render buttons with correct variants', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('button-primary')).toBeInTheDocument();
    expect(screen.getByTestId('button-secondary')).toBeInTheDocument();
  });

  it('should render buttons with start icons', () => {
    render(<HeroSection />);

    const primaryButton = screen.getByTestId('button-primary');
    const secondaryButton = screen.getByTestId('button-secondary');

    expect(primaryButton).toHaveAttribute('data-start-icon', 'true');
    expect(secondaryButton).toHaveAttribute('data-start-icon', 'true');
  });

  it('should have correct CSS classes', () => {
    render(<HeroSection />);

    const heroSection = screen.getByText('hero.title').closest('.hero');
    expect(heroSection).toBeInTheDocument();
  });

  it('should render both call to actions in hero-ctas container', () => {
    render(<HeroSection />);

    const heroSection = screen.getByText('hero.title').closest('.hero');
    const ctaContainer = heroSection?.querySelector('.hero-ctas');
    
    expect(ctaContainer).toBeInTheDocument();
    expect(screen.getByTestId('call-to-action-primary')).toBeInTheDocument();
    expect(screen.getByTestId('call-to-action-secondary')).toBeInTheDocument();
  });
}); 