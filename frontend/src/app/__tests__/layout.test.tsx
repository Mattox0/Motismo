import { metadata } from '../layout';

describe('Layout', () => {
  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Motismo');
    expect(metadata.description).toBe('Application de quizz interactifs');
  });
});
