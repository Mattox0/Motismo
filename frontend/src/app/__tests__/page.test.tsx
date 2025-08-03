/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';

import Home from '../page';

jest.mock('@/components/HowItWorks', () => () => <div data-testid="how-it-works" />);
jest.mock('@/components/sections/FonctionalitySection', () => ({
  FonctionalitySection: () => <div data-testid="functionality-section" />,
}));
jest.mock('@/components/sections/FooterHeroSection', () => ({
  FooterHeroSection: () => <div data-testid="footer-hero-section" />,
}));
jest.mock('@/components/sections/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section" />,
}));
jest.mock('@/layout/GlobalLayout', () => ({
  GlobalLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="global-layout">{children}</div>
  ),
}));

describe('Home Page', () => {
  it('should render all the main sections', () => {
    render(<Home />);

    expect(screen.getByTestId('global-layout')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('functionality-section')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('footer-hero-section')).toBeInTheDocument();
  });
});
