import { render, screen } from '@testing-library/react';

import { FooterHeroSection } from '../FooterHeroSection';

describe('FooterHeroSection', () => {
  it('renders without crashing', () => {
    render(<FooterHeroSection />);
    expect(true).toBe(true);
  });
}); 