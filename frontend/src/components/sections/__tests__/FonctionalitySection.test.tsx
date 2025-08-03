import { render, screen } from '@testing-library/react';

import { FonctionalitySection } from '../FonctionalitySection';

describe('FonctionalitySection', () => {
  it('renders without crashing', () => {
    render(<FonctionalitySection />);
    expect(true).toBe(true);
  });
}); 