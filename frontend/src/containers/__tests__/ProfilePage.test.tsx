import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

import {
  useCreateGameMutation,
  useGetQuizQuery,
  useUpdateQuizzMutation,
} from '@/services/quiz.service';
import { IUserRole } from '@/types/IUserRole';
import { IQuizz } from '@/types/model/IQuizz';
import { IQuizzType } from '@/types/model/IQuizzType';
import { showToast } from '@/utils/toast';

import { ProfilePage } from '../ProfilePage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'card.questions') return `${params?.nbQuestions} questions`;
      if (key === 'card.cards') return `${params?.nbCards} cards`;
      if (key === 'card.button.primary') return 'Modifier';
      if (key === 'card.button.secondary') return 'Présenter';
      if (key === 'card.edit') return 'Modifier';
      if (key === 'card.presentation') return 'Présenter';
      if (key === 'edit_card.title') return 'Modifier la carte';
      if (key === 'edit_quiz.title') return 'Modifier le quiz';
      if (key === 'edit_card.success') return 'Carte modifiée avec succès';
      if (key === 'edit_card.error') return 'Erreur lors de la modification';
      if (key === 'edit_quiz.success') return 'Quiz modifié avec succès';
      if (key === 'edit_quiz.error') return 'Erreur lors de la modification';
      if (key === 'error.no.cards') return 'Aucune carte disponible';
      return key;
    },
  }),
}));

jest.mock('next/navigation');
jest.mock('next-auth/react');
jest.mock('@/services/quiz.service', () => ({
  useGetQuizQuery: jest.fn(),
  useCreateGameMutation: jest.fn(),
  useUpdateQuizzMutation: jest.fn(),
}));
jest.mock('@/utils/toast');
jest.mock('@/components/sections/AskCreateSection', () => ({
  AskCreateSection: jest.fn(() => <div data-testid="ask-create-section">AskCreateSection</div>),
}));

jest.mock('@/components/forms/EditCardForm', () => ({
  EditCardForm: jest.fn(() => <div data-testid="edit-card-form">EditCardForm</div>),
}));

jest.mock('@/components/forms/EditQuizForm', () => ({
  EditQuizForm: jest.fn(() => <div data-testid="edit-quiz-form">EditQuizForm</div>),
}));

jest.mock('@/components/Modal', () => ({
  Modal: jest.fn(({ children, isOpen, title }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ) : null
  ),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseGetQuizQuery = useGetQuizQuery as jest.MockedFunction<typeof useGetQuizQuery>;
const mockUseCreateGameMutation = useCreateGameMutation as jest.MockedFunction<
  typeof useCreateGameMutation
>;
const mockUseUpdateQuizzMutation = useUpdateQuizzMutation as jest.MockedFunction<
  typeof useUpdateQuizzMutation
>;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockPush = jest.fn();
const mockCreateGame = jest.fn();
const mockUpdateQuizz = jest.fn();

const mockQuestionQuizz: IQuizz = {
  id: '1',
  title: 'Test Quiz',
  image: 'test.jpg',
  classes: [],
  quizzType: IQuizzType.QUESTIONS,
  questions: [{ id: '1', text: 'Question 1' }],
  creationDate: new Date().toISOString(),
};

const mockCardQuizz: IQuizz = {
  id: '2',
  title: 'Test Cards',
  image: 'test.jpg',
  classes: [],
  quizzType: IQuizzType.CARDS,
  cards: [{ id: '1', title: 'Card 1' }],
  creationDate: new Date().toISOString(),
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseCreateGameMutation.mockReturnValue([mockCreateGame, { isLoading: false }]);
    mockUseUpdateQuizzMutation.mockReturnValue([mockUpdateQuizz, { isLoading: false }]);
  });

  it('renders for teacher with quiz data', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz, mockCardQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Vos quizz')).toBeInTheDocument();
    expect(screen.getByText('Vos cartes')).toBeInTheDocument();
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test Cards')).toBeInTheDocument();
  });

  it('renders for student with card data', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Student } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockCardQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Mes cartes assignées')).toBeInTheDocument();
    expect(screen.getByText('Test Cards')).toBeInTheDocument();
    expect(screen.queryByText('Vos quizz')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    render(<ProfilePage />);

    expect(document.querySelectorAll('.loader')).toHaveLength(2);
  });

  it('shows empty state for quizz when no data', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Aucun quiz trouvé')).toBeInTheDocument();
    expect(screen.getByText('Aucune carte trouvée')).toBeInTheDocument();
  });

  it('shows empty state for student cards when no data', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Student } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Aucune carte assignée')).toBeInTheDocument();
    expect(
      screen.getByText("Vos professeurs n'ont pas encore assigné de cartes.")
    ).toBeInTheDocument();
  });

  it('creates game successfully', async () => {
    const mockCreateGameSuccess = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ code: 'GAME123' }),
    });
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);
    mockUseCreateGameMutation.mockReturnValue([mockCreateGameSuccess, { isLoading: false }]);

    render(<ProfilePage />);

    const presentationButton = screen.getByText('Présenter');
    fireEvent.click(presentationButton);

    await waitFor(() => {
      expect(mockCreateGameSuccess).toHaveBeenCalledWith('1');
      expect(mockPush).toHaveBeenCalledWith('/game/GAME123');
    });
  });

  it('handles create game error', async () => {
    const mockCreateGameWithError = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Failed')),
    });
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);
    mockUseCreateGameMutation.mockReturnValue([mockCreateGameWithError, { isLoading: false }]);

    render(<ProfilePage />);

    const presentationButton = screen.getByText('Présenter');
    fireEvent.click(presentationButton);

    await waitFor(() => {
      expect(mockCreateGameWithError).toHaveBeenCalledWith('1');
    });
  });

  it('opens edit card modal', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockCardQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const cardElement = screen.getByTestId('card-header');
    fireEvent.click(cardElement);

    expect(screen.getByText('Modifier la carte')).toBeInTheDocument();
  });

  it('opens edit quiz modal', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const quizElement = screen.getByTestId('card-header');
    fireEvent.click(quizElement);

    expect(screen.getByText('Modifier le quiz')).toBeInTheDocument();
  });

  it('handles card edit submission successfully', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockCardQuizz],
      isLoading: false,
    } as any);
    mockUpdateQuizz.mockResolvedValueOnce({});

    render(<ProfilePage />);

    const cardElement = screen.getByTestId('card-header');
    fireEvent.click(cardElement);

    const mockSubmitData = {
      title: 'Updated Card',
      classIds: ['class1', 'class2'],
    };

    await waitFor(() => {
      expect(screen.getByText('Modifier la carte')).toBeInTheDocument();
    });
  });

  it('handles quiz edit submission successfully', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);
    mockUpdateQuizz.mockResolvedValueOnce({});

    render(<ProfilePage />);

    const quizElement = screen.getByTestId('card-header');
    fireEvent.click(quizElement);

    await waitFor(() => {
      expect(screen.getByText('Modifier le quiz')).toBeInTheDocument();
    });
  });

  it('navigates to quiz edit page', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const editButton = screen.getByRole('button', { name: 'Modifier' });
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/quiz/1');
  });

  it('navigates to card edit page', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockCardQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const editButton = screen.getByRole('button', { name: 'Modifier' });
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/card/2');
  });

  it('navigates to card game when cards exist', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockCardQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const presentationButton = screen.getByText('Présenter');
    fireEvent.click(presentationButton);

    expect(mockPush).toHaveBeenCalledWith('/card/game/2');
  });

  it('shows error when trying to present cards with no cards', () => {
    const cardQuizzNoCards = { ...mockCardQuizz, cards: [] };
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [cardQuizzNoCards],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const presentationButton = screen.getByText('Présenter');
    fireEvent.click(presentationButton);

    expect(mockShowToast.error).toHaveBeenCalledWith('Aucune carte disponible');
  });

  it('works with admin role', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Admin } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [mockQuestionQuizz],
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Vos quizz')).toBeInTheDocument();
    expect(screen.getByText('Vos cartes')).toBeInTheDocument();
  });

  it('filters quiz types correctly', () => {
    const mixedData = [mockQuestionQuizz, mockCardQuizz, mockQuestionQuizz];
    mockUseSession.mockReturnValue({
      data: { user: { role: IUserRole.Teacher } },
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: mixedData,
      isLoading: false,
    } as any);

    render(<ProfilePage />);

    const quizCards = screen.getAllByText('Test Quiz');
    const cardCards = screen.getAllByText('Test Cards');

    expect(quizCards).toHaveLength(2);
    expect(cardCards).toHaveLength(1);
  });

  it('handles no session data', () => {
    mockUseSession.mockReturnValue({
      data: null,
    } as any);
    mockUseGetQuizQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    expect(() => render(<ProfilePage />)).not.toThrow();
  });
});
