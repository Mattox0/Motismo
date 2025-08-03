import { render, screen } from '@testing-library/react';

import { GameProvider } from '@/providers/GameProvider';

import { GamePage } from '../GamePage';
import { IQuizzType } from '@/types/model/IQuizzType';

describe('GamePage', () => {
  it('renders without crashing', () => {
    const mockProps = {
      code: 'TEST123',
      quizz: { id: '1', title: 'Test Quiz', author: { id: '1', username: 'test', email: 'test@test.com', creationDate: new Date() }, quizzType: IQuizzType.QUESTIONS  , creationDate: new Date() },
    };
    
    render(
      <GameProvider>
        <GamePage {...mockProps} />
      </GameProvider>
    );
    expect(true).toBe(true);
  });
}); 