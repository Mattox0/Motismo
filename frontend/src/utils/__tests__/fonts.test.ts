import { poppins } from '../fonts';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Poppins: jest.fn(() => ({
    style: { fontFamily: 'Poppins' },
    className: 'font-poppins',
    variable: '--font-poppins',
  })),
}));

describe('fonts', () => {
  test('should export poppins font configuration', () => {
    expect(poppins).toBeDefined();
    expect(poppins.style).toBeDefined();
    expect(poppins.className).toBeDefined();
    expect(poppins.variable).toBeDefined();
  });

  test('should have correct font family', () => {
    expect(poppins.style.fontFamily).toBe('Poppins');
  });

  test('should have correct CSS variable', () => {
    expect(poppins.variable).toBe('--font-poppins');
  });
});
