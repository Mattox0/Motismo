import { render, screen, fireEvent } from '@testing-library/react';

import { useGame } from '@/providers/GameProvider';
import { IQuizz } from '@/types/model/IQuizz';
import { IQuizzType } from '@/types/model/IQuizzType';

import { Lobby } from '../Lobby';

jest.mock('@/providers/GameProvider', () => ({
  useGame: jest.fn(),
}));

jest.mock('react-qr-code', () => {
  return function MockQRCode({ value }: { value: string }) {
    return <div data-testid="qr-code">{value}</div>;
  };
});

describe('Lobby', () => {
  const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;
  const mockHandleClick = jest.fn();

  const mockQuizz: IQuizz = {
    id: '1',
    title: 'Test Quiz',
    image: '',
    questions: [],
    author: { id: '1', username: 'Author', email: 'author@example.com', creationDate: new Date() },
    quizzType: IQuizzType.QUESTIONS,
    creationDate: new Date(),
  };

  const mockUsers = [
    { id: '1', name: 'User 1', avatar: 'avatar1.jpg' },
    { id: '2', name: 'User 2', avatar: 'avatar2.jpg' },
  ];

  beforeEach(() => {
    mockUseGame.mockReturnValue({
      users: mockUsers,
    } as any);
  });

  it('renders quiz title and code', () => {
    render(<Lobby quizz={mockQuizz} code="TEST123" />);

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();
  });

  it('shows start button when presentation is true', () => {
    render(
      <Lobby quizz={mockQuizz} code="TEST123" presentation={true} handleClick={mockHandleClick} />
    );

    const startButton = screen.getByText('Démarrer le quizz');
    expect(startButton).toBeInTheDocument();

    fireEvent.click(startButton);
    expect(mockHandleClick).toHaveBeenCalled();
  });

  it('shows waiting message when presentation is false', () => {
    render(<Lobby quizz={mockQuizz} code="TEST123" presentation={false} />);

    expect(screen.getByText('En attente du présentateur pour lancer le quizz')).toBeInTheDocument();
  });
});
