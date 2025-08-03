/// <reference types="@testing-library/jest-dom" />

import { formatDate } from '../formatDate';

describe('formatDate utility', () => {
  it('should format a valid Date object correctly', () => {
    const date = new Date('2023-12-25');
    expect(formatDate(date)).toBe('25/12/2023');
  });

  it('should format a valid date string correctly', () => {
    expect(formatDate('2023-01-01')).toBe('01/01/2023');
  });

  it('should handle single digit dates and months with padding', () => {
    const date = new Date('2023-01-05');
    expect(formatDate(date)).toBe('05/01/2023');
  });

  it('should return "Date non disponible" for null', () => {
    expect(formatDate(null)).toBe('Date non disponible');
  });

  it('should return "Date non disponible" for undefined', () => {
    expect(formatDate(undefined)).toBe('Date non disponible');
  });

  it('should return "Date invalide" for invalid date string', () => {
    expect(formatDate('invalid-date')).toBe('Date invalide');
  });

  it('should return "Date invalide" for invalid Date object', () => {
    const invalidDate = new Date('invalid');
    expect(formatDate(invalidDate)).toBe('Date invalide');
  });

  it('should handle ISO date strings', () => {
    expect(formatDate('2023-06-15T10:30:00.000Z')).toBe('15/06/2023');
  });
});
